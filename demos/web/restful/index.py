# -*- coding:utf-8 -*-
"""
    index action demo
    author comger@gmail.com
"""

import tornado.web
from bson import ObjectId

from kpages import url, ContextHandler, get_context
from logic import mongo_util

@url(r"/")
class IndexHandler(tornado.web.RequestHandler, ContextHandler):
    def get(self):
        self.write('Hello world!')


@url(r"/count")
class CountHandler(tornado.web.RequestHandler, ContextHandler):
    async def get(self):
        count = await mongo_util.m_count('alarm')
        #count = await mongo_util.m_count('sensors', dbname='wxkydq')
        #count = await mongo_util.m_count('sensors', dbname='wxkydq', host='192.168.111.149:27019')
        self.write(f'count: {count}')


@url(r"/list")
class ListHandler(tornado.web.RequestHandler, ContextHandler):
    async def get(self):
        ls,page = await mongo_util.m_list('alarm', fields={'data':0})
        _id = ls[0]['_id']
        doc = await mongo_util.m_find_one('alarm', _id=ObjectId(_id))
        self.write(dict(doc=doc, data=ls, page=page))

@url(r"/agg")
class AggrHandler(tornado.web.RequestHandler, ContextHandler):
    async def get(self):
        pipline = [{'$group':{'_id':'$code', 'count':{'$sum':1}}}]
        rs = await mongo_util.m_aggregate('alarm', pipline)
        self.write(rs)

@url(r"/distinct")
class DictHandler(tornado.web.RequestHandler, ContextHandler):
    async def get(self):
        rs = await mongo_util.m_distinct('alarm', 'code')
        self.write(dict(arr=rs))


@url(r"/crud")
class CURDHandler(tornado.web.RequestHandler, ContextHandler):
    async def get(self):
        dbname = 'comgertest'
        table = 'sensors'
        #_id = await mongo_util.m_insert(table, name='comger', age=12, dbname=dbname)
        #_id = ObjectId(_id)
        #await mongo_util.m_update(table, {'_id': _id}, age=30, dbname=dbname)
        #await mongo_util.m_update(table, {'_id': 1}, age=1, upsert=True, dbname=dbname)
        await mongo_util.m_update(table, {'_id':{'$lt':ObjectId("5d59ffba7819221bf09c96a1")}}, tz=1, multi=True, dbname=dbname)
        #doc = await mongo_util.m_find_one(table, _id=_id, dbname=dbname)
        self.write('ok')
