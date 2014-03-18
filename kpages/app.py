#!/usr/bin/env python
# -*- coding:utf-8 -*-
"""
    author comger@gmail.com
"""
import tornado.web
import tornado.ioloop

from inspect import isclass
from tornado.httpserver import HTTPServer
from optparse import OptionParser, OptionGroup
from router import load_handlers
from context import LogicContext
from utility import refresh_config, app_path, set_default_encoding,get_members

def get_ui_modules():
    """
    return ui module members in ACTION_DIR
    """
    m_filter = lambda m: isclass(m) and issubclass(m, tornado.web.UIModule)
    ms =  get_members(__conf__.ACTION_DIR, member_filter=m_filter)
    if 'tornado.web.UIModule' in ms:
        del ms['tornado.web.UIModule']
    
    newms = {}
    for key,val in ms.items():
        newms[key.replace('.','_')] = val
    
    return newms

def get_ui_methods():
    """
    return uimethod methods in ACTION_DIR
    """
    m_filter = lambda m: hasattr(m,'__reg_ui__') and m.__reg_ui__ ==True
    ms =  get_members(__conf__.ACTION_DIR, member_filter=m_filter)
    newms = {}

    for key,val in ms.items():
        newms[key.replace('.','_')] = val
    
    return newms

class WebApp(object):
    settings = property(lambda self: __conf__.__dict__)
    handlers = property(lambda self: self._handlers)
    uimodules = property(lambda self: self._modules)
    uimethods = property(lambda self: self._methods)
    webapp = property(lambda self: self._webapp)

    def __init__(self, port=None,bindip=None, handlers=None, callback=None):
        self._port = port or __conf__.PORT
        self._ip = bindip or __conf__.BIND_IP
        self._callback = callback
        self._handlers = load_handlers(__conf__.ACTION_DIR)
        self._modules = get_ui_modules()
        self._methods = get_ui_methods()
        self._webapp = self._get_webapp()
        __conf__.APP = self._webapp    

    def _get_webapp(self):
        settings = {"debug": __conf__.DEBUG,
                    "static_path": app_path(__conf__.STATIC_DIR_NAME),
                    "template_path": app_path(__conf__.TEMPLATE_DIR_NAME),
                    "gzip": __conf__.GZIP,
                    "cookie_secret": __conf__.COOKIE_SECRET,
                    "ui_modules":self.uimodules,
                    "ui_methods":self.uimethods,
                    "xsrf_cookies": __conf__.XSRF_COOKIES}

        return tornado.web.Application(self._handlers, **settings)

    def _run_server(self):
        if __conf__.DEBUG:
            self._webapp.listen(self._port, address=self._ip)
        else:
            server = HTTPServer(self._webapp)
            server.bind(self._port, address=self._ip)
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
    parser.add_option("--ip", dest="ip", default=None,
                      help="bind accept ip for server")
    parser.add_option("--debug", dest="debug", action="store_true",
                      default=None, help="Debug mode.")
    parser.add_option("--ndebug", dest="debug",
                      action="store_false", help="No Debug mode.")

    return parser.parse_args()


def run(callback=None):
    set_default_encoding()
    opts, args = _get_opt()
    refresh_config(opts.config)

    __conf__.PORT = opts.port or __conf__.PORT
    __conf__.DEBUG = opts.debug or __conf__.DEBUG
    __conf__.BIND_IP = opts.ip or __conf__.BIND_IP

    WebApp(callback=callback).run()

__all__ = ["run", "WebApp", "get_ui_modules", "get_ui_methods"]
