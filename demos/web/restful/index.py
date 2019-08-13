# -*- coding:utf-8 -*-
"""
    index action demo
    author comger@gmail.com
"""

import tornado.web
from kpages import url, ContextHandler, get_context


@url(r"/")
class IndexHandler(tornado.web.RequestHandler, ContextHandler):
    def get(self):
        self.write('Hello world!')