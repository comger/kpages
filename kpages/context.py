# -*- coding:utf-8 -*-
"""
    author comger@gmail.com
    logic context for db, cache
    db is mongodb,cache is redis
"""
import os
import time
import tornado.gen as gen

from threading import local
from hashlib import sha1

from tornado.web import RequestHandler
from tornado.websocket import WebSocketHandler
from gridfs import GridFS

from redis import Redis
from pymongo import MongoClient
from motor.motor_tornado import MotorClient

session_id = lambda: sha1('%s%s' % (os.urandom(16), time.time())).hexdigest()


class ContextHandler(object):
    """
    base handler for session
    """
    def _execute(self, transforms, *args, **kwargs):
        ''' select base handler for self '''
        with LogicContext():
            get_context().handler = self
            if isinstance(self, WebSocketHandler):
                WebSocketHandler._execute(self, transforms, *args, **kwargs)
            elif isinstance(self, RequestHandler):
                RequestHandler._execute(self, transforms, *args, **kwargs)

    def session(self, key, val=None):
        ''' session for handler '''
        return get_context().session(self.get_redis_key(key), val)
    
    def clear_session(self, key):
        get_context().clear_session(self.get_redis_key(key))
    
    def get_redis_key(self, key):
        _id = self.get_secure_cookie('session_id', None)
        if not _id:
            _id = session_id()
            self.set_secure_cookie('session_id', _id)
        return '{0}.{1}'.format(_id, key)
        

class LogicContext(object):
    """
        logic context for mongodb and redis cache
    """
    _thread_local = local()

    def __init__(self, redis_host=None, mongo_host=None):
        self._redis_host = redis_host or __conf__.CACHE_HOST
        self._mongo_host = mongo_host or __conf__.DB_HOST
        self._db_conn = None
        self._cache = None
        self._sync_db = None
        self._motor_clt = None

    def __enter__(self):
        if not hasattr(self._thread_local, "contexts"):
            self._thread_local.contexts = []
        self._thread_local.contexts.append(self)
        return self

    def __exit__(self, exc_type, exc_value, trackback):

        self._thread_local.contexts.remove(self)
        if self._db_conn:
            self._db_conn.disconnect()

    @classmethod
    def get_redis(cls):
        ''' get redis from context '''
        host = __conf__.CACHE_HOST
        h, p = host.split(":") if ":" in host else (host, 6379)

        if not hasattr(cls,'__cache__') or (cls.__cache__ and not cls.__cache__.ping()):
            cls.__cache__ = Redis(
                host=h, port=int(p), socket_timeout=__conf__.SOCK_TIMEOUT)

        return cls.__cache__

    def get_gfs(self, name=None):
        ''' get gfs from context '''
        name = name or __conf__.GFS_NAME
        return GridFS(self.get_mongo(name))


    def get_motor(self, name=None):
        ''' motor client '''
        name = name or __conf__.DB_NAME
        if not self._motor_clt:
            self._motor_clt = MotorClient(host=__conf__.DB_HOST)

        return self._motor_clt[name]


    def session(self, key, val=None, expire= None):
        '''
        redis session for tornado
        '''
        expire = expire or __conf__.SESSION_EXPIRE
        return self.get_redis().setex(key, val, expire) if val else self.get_redis().get(key)
    
    def clear_session(self, key):
        self.get_redis().delete(key)

    @classmethod
    def get_context(cls):
        return hasattr(cls._thread_local, "contexts") and cls._thread_local.contexts and \
            cls._thread_local.contexts[-1] or cls()

    @classmethod 
    def get_mongoclient(cls, name=None):
        """
        get mongoclient in application
        """
        name = name or __conf__.DB_NAME
        if not hasattr(cls,'__mongoclient__'):
            cls.__mongoclient__ = MongoClient(host = __conf__.DB_HOST,
                socketTimeoutMS = __conf__.SOCK_TIMEOUT_MS)
        
        return cls.__mongoclient__[name]
    

    @classmethod
    def get_replicaset(cls, hosts=None, replicaSet=None):
        hosts = hosts or __conf__.ReplicaSetHost
        replicaSet = replicaSet or __conf__.replicaSet

        if not hasattr(cls, '__replicaset__'):
            cls.__replicaset__ = MongoReplicaSetClient(hosts, replicaSet=relicaSet)
            
        return cls.__replicaset__


get_context = LogicContext.get_context

__all__ = ["ContextHandler", "LogicContext", "get_context"]
