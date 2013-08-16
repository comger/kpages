# -*- coding:utf-8 -*- 
"""
    author comger@gmail.com
    logic context for db, cache 
    db is mongodb,cache is redis
"""
import os
import time
from threading import local
from hashlib import sha1

from redis import Redis
from pymongo import Connection
from tornado.web import RequestHandler
try:
    import motor
except:
    print 'can not import motor '


session_id = lambda :sha1('%s%s'%(os.urandom(16),time.time())).hexdigest()

class ContextHandler(RequestHandler):
    def _execute(self, transforms, *args, **kwargs):
        with LogicContext():
            super(ContextHandler, self)._execute(transforms, *args, **kwargs)

    def session(self,key,val=None):
        _id = self.get_secure_cookie('session_id',None)
        if not _id:
            self.set_secure_cookie('session_id',session_id())
        return get_context().session(_id,key,val)


class LogicContext(object):
    """
        logic context for mongodb and redis cache
    """
    _thread_local = local()
    
    def __init__(self,cache_host=None,db_host=None):
        self._cache_host = cache_host or __conf__.CACHE_HOST
        self._db_host = db_host or __conf__.DB_HOST
        self._db_conn = None
        self._sync_db = None
        self._session = None

    def __enter__(self):
        if not hasattr(self._thread_local, "contexts"): self._thread_local.contexts = []
        self._thread_local.contexts.append(self)
        return self
    
    def __exit__(self,exc_type, exc_value, trackback):
        self._thread_local.contexts.remove(self)
        if self._db_conn:
            self._db_conn.disconnect()

    def get_redis(self):
        host = self._cache_host
        h, p = host.split(":") if ":" in host else (host, 6379)
        cache = Redis(host = h, port = int(p), socket_timeout = __conf__.SOCK_TIMEOUT)
        return cache

    def get_mongo(self,name=None):
        name = name or __conf__.DB_NAME
        if not self._db_conn:
            self._db_conn = Connection(host = self._db_host, network_timeout= __conf__.SOCK_TIMEOUT)

        return self._db_conn[name]

    def get_aync_mongo(self,name=None):
        """ 非阻塞的pympongo 支持，需要安装motor """
        name = name or __conf__.DB_NAME
        if not self._sync_db:
            client = motor.MotorClient(host = self._db_host).open_sync()
            self._sync_db = client[name]

        return self._sync_db
    
    def session(self,_id,key,val=None,expire = None):
        if not self._session:
            self._session = self.get_mongo('session')['session']

        dt = self._session.find_one(dict(_id=_id)) or {}
        if not val: return dt.get('data',{}).get(key)
        
        if dt:
            self._session.update(dict(_id=_id),{'$set':{'data.'+key:val}})
        else:
            self._session.insert(dict(_id=_id,data=dict(key=val)))
        return val



    @classmethod
    def get_context(cls):
        return hasattr(cls._thread_local, "contexts") and cls._thread_local.contexts and \
            cls._thread_local.contexts[-1] or None


get_context = LogicContext.get_context

__all__ = ["ContextHandler","LogicContext", "get_context"]
