# -*- coding:utf-8 -*-
"""
    index action demo
    author comger@gmail.com
"""

import tornado

from kpages import url, ContextHandler


@url(r"/")
class IndexHandler(ContextHandler,tornado.web.RequestHandler):
    def get(self):
        self.write('Hello world!')


