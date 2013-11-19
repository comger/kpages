#!/usr/bin/env python
#-*- coding:utf-8 -*-

import unittest
from kpages.router import url, _sorted_hanlders
import tornado
import tornado.testing

@url('/(\w+)/?', 1)
class TestHandler(tornado.web.RequestHandler):
    def get(self, value):
        self.write(value)

@url('/test/?', 0)
class Test1Handler(tornado.web.RequestHandler):
    def get(self):
        self.write("good test")

class TestRouter(tornado.testing.AsyncHTTPTestCase):
    def get_app(self):
        return tornado.web.Application(_sorted_hanlders([Test1Handler, TestHandler]))

    def test_url(self):
        self.http_client.fetch(self.get_url("/test/"), self.stop)
        response = self.wait()
        self.assertEqual(response.body, "good test")


        self.http_client.fetch(self.get_url("/test1/"), self.stop)
        response = self.wait()
        self.assertEqual(response.body, "test1")


if __name__ == "__main__":
    unittest.main()
