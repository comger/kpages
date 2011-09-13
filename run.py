#!/usr/bin/env python
#-*- coding:utf-8 -*-


import os
from tornado.httpserver import HTTPServer
from tornado.web import Application, RequestHandler,StaticFileHandler
from tornado.ioloop import IOLoop

class IndexHandler(RequestHandler):
    def get(self):
        self.render(os.path.abspath("demo/api.html"))


class GaHandler(RequestHandler):
    def get(self):
        self.render(os.path.abspath("demo/Graphic.html"))
settings = {
    "static_path" : os.path.join(os.path.dirname(__file__), "static"),
}

application = Application([
    (r"/demo/ga", GaHandler),
    (r"/",IndexHandler),
    (r"/(.*)",StaticFileHandler,dict(path = os.path.dirname(__file__)))
], **settings)
port=8002
if __name__ == "__main__":
    server = HTTPServer(application)
    server.listen(port)
    print "Run",port
    IOLoop.instance().start()
