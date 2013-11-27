# -*- coding:utf-8 -*-
"""
    index action demo
    author comger@gmail.com
"""
import tornado

from tornado import gen
from kpages import url, ContextHandler, LogicContext, get_context, service_async


@url(r"/")
class IndexHandler(ContextHandler,tornado.web.RequestHandler):
    def get(self):
        self.write('Hello world!')

