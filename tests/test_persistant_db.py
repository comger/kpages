#!/usr/bin/env python2
# -*- coding:utf-8 -*-
import unittest
import pymongo
import json
from kpages.router import url, _sorted_hanlders
from kpages.context import ContextHandler, get_context
from kpages.app import WebApp
from kpages.utility import refresh_config
import tornado
import tornado.testing
import tornado.gen


@url('/sync/init/?')
class SyncInitHandler(ContextHandler, tornado.web.RequestHandler):
    def get(self):
        ctx = get_context()
        mgo_id = id(ctx.get_mongo().connection)
        r = ctx.get_mongo().test_persistent_db.find_one({'sync': True})
        ctx.get_mongo().test_persistent_db.update(
            {'sync': True}, {'$set': {'round': 1}})

        self.write({'round': r['round'], 'id': mgo_id})


@url('/sync/round1/?')
class SyncSecondHandler(ContextHandler, tornado.web.RequestHandler):
    def get(self):
        ctx = get_context()
        mgo_id = id(ctx.get_mongo().connection)
        r = ctx.get_mongo().test_persistent_db.find_one({'sync': True})
        self.write({'round': r['round'], 'id': mgo_id})


@url('/async/init/?')
class AsyncInitHandler(ContextHandler, tornado.web.RequestHandler):

    @tornado.gen.coroutine
    def get(self):
        ctx = get_context()
        mt = yield ctx.get_motor()
        mgo_id = id(mt.connection)
        r = yield mt.test_persistent_db.find_one({'async': True})
        yield mt.test_persistent_db.update(
            {'async': True}, {'$set': {'round': 1}})

        self.write({'round': r['round'], 'id': mgo_id})


@url('/async/round1/?')
class AsyncSecondHandler(ContextHandler, tornado.web.RequestHandler):

    @tornado.gen.coroutine
    def get(self):
        ctx = get_context()
        mt = yield ctx.get_motor()
        mgo_id = id(mt.connection)
        r = yield mt.test_persistent_db.find_one({'async': True})

        self.write({'round': r['round'], 'id': mgo_id})


class TestPersistentDB(tornado.testing.AsyncHTTPTestCase):
    def setUp(self):
        refresh_config()
        __conf__.DEBUG = False
        __conf__.ACTION_DIR = []
        __conf__.PERSISTENT_DB_CONNECTION = True
        __conf__.DB_HOST = 'localhost'
        __conf__.DB_NAME = 'kpages_test'

        self._dbconn = pymongo.MongoClient(__conf__.DB_HOST)
        self._db = self._dbconn[__conf__.DB_NAME]
        self._db.test_persistent_db.insert({'sync': True, 'round': 0})
        self._db.test_persistent_db.insert({'async': True, 'round': 0})

        super(TestPersistentDB, self).setUp()

    def tearDown(self):
        self._dbconn.drop_database(__conf__.DB_NAME)
        super(TestPersistentDB, self).tearDown()

    def get_app(self):
        self._kwebapp = WebApp(
            handlers=_sorted_hanlders(
                [SyncInitHandler, SyncSecondHandler, AsyncInitHandler, AsyncSecondHandler]))
        return self._kwebapp._webapp

    def test_sync_client(self):
        self.http_client.fetch(self.get_url("/sync/init/"), self.stop)
        response = json.load(self.wait().buffer)
        init_id, _round = response['id'], response['round']
        self.assertEqual(_round, 0)

        self.http_client.fetch(self.get_url("/sync/round1/"), self.stop)
        response = json.load(self.wait().buffer)
        second_id, _round = response['id'], response['round']
        self.assertEqual(_round, 1)
        self.assertEqual(init_id, second_id)

    def test_async_client(self):
        self.http_client.fetch(self.get_url("/async/init/"), self.stop)
        response = json.load(self.wait().buffer)
        init_id, _round = response['id'], response['round']
        self.assertEqual(_round, 0)

        self.http_client.fetch(self.get_url("/async/round1/"), self.stop)
        response = json.load(self.wait().buffer)
        second_id, _round = response['id'], response['round']
        self.assertEqual(_round, 1)
        self.assertEqual(init_id, second_id)


if __name__ == "__main__":
    unittest.main()

# vim: ts=4 sw=4 sts=4 expandtab
