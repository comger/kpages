# -*- coding:utf-8 -*-
"""
    index action demo
    author comger@gmail.com
"""
import motor
import tornado

from tornado import gen
from kpages import url, ContextHandler, LogicContext, get_context, service_async,mongo_conv


@url(r"/")
class IndexHandler(ContextHandler,tornado.web.RequestHandler):
    def get(self):
        self.write('Hello world!')


@url(r"/json")
class JsonHandler(ContextHandler,tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        coll = get_context().get_async_mongo()['account']
        cursor = coll.find()
        motor.Op(cursor.to_list,callback=self.end)
    
    def end(self,rs):
        self.write(dict(data=mongo_conv(list(rs))))
        self.finish()

@gen.engine
def get_motor(callback=None):
    mc = motor.MotorClient(host=__conf__.DB_HOST).open_sync()
    coll = mc.migrant.account
    coll.find({},callback=callback) 

@url(r"/json1")
class Json1Handler(ContextHandler,tornado.web.RequestHandler):
    def get(self):
        coll = get_context().get_mongoclient(name='migrant')['account']
        rs = coll.find()
        
        self.write(dict(data=mongo_conv(list(rs))))
        self.finish()
