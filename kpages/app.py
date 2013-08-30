#!/usr/bin/env python
# -*- coding:utf-8 -*-
"""
    author comger@gmail.com
"""
import tornado.web
import tornado.ioloop

from tornado.httpserver import HTTPServer
from optparse import OptionParser, OptionGroup
from router import load_handlers
from context import LogicContext
from utility import reflesh_config, app_path, set_default_encoding


class WebApp(object):
    settings = property(lambda self: __conf__.__dict__)
    handlers = property(lambda self: self._handlers)
    webapp = property(lambda self: self._webapp)

    def __init__(self, port=None, callback=None):
        self._port = port or __conf__.PORT
        self._callback = callback
        self._handlers = load_handlers(__conf__.ACTION_DIR)
        self._webapp = self._get_webapp()

    def _get_webapp(self):
        settings = {"debug": __conf__.DEBUG,
                    "static_path": app_path(__conf__.STATIC_DIR_NAME),
                    "template_path": app_path(__conf__.TEMPLATE_DIR_NAME),
                    "gzip": __conf__.GZIP,
                    "cookie_secret": __conf__.COOKIE_SECRET,
                    "xsrf_cookies": __conf__.XSRF_COOKIES}

        return tornado.web.Application(self._handlers, **settings)

    def _run_server(self):
        if __conf__.DEBUG:
            self._webapp.listen(self._port)
        else:
            server = HTTPServer(self._webapp)
            server.bind(self._port)
            server.start(0)
        tornado.ioloop.IOLoop.instance().start()

    def run(self):
        if self._callback:
            self._callback(self)
        self._run_server()


def _get_opt():
    parser = OptionParser("%prog [options]", version="%prog v0.9")
    parser.add_option("--config", dest="config",
                      default='setting.py', help="set config for server")
    parser.add_option("--port", dest="port", default=None,
                      help="set http port for server")
    parser.add_option("--debug", dest="debug", action="store_true",
                      default=None, help="Debug mode.")
    parser.add_option("--ndebug", dest="debug",
                      action="store_false", help="No Debug mode.")

    return parser.parse_args()


def run(callback=None):
    set_default_encoding()
    opts, args = _get_opt()
    reflesh_config(opts.config)

    if opts.debug is not None:
        __conf__.DEBUG = opts.debug

    WebApp(opts.port, callback).run()

__all__ = ["run", "WebApp"]
