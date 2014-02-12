# -*- coding:utf-8 -*-
import tornado.gen as gen
from kpages import srvcmd,get_context

@srvcmd('demofun')
def demofun(data):
    print '1', data



@srvcmd('demofun')
def demofun1(data):
    print '2',data


@gen.coroutine
def async_get():
    db = yield get_context().get_motor()
    coll = yield db['test']
    return coll.find()
