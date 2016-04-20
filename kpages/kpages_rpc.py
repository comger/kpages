#!/usr/bin/env python
# -*- coding:utf-8 -*-
"""
    author comger@gmail.com
"""
import sys
import json
import tornado.options

from datetime import datetime
from pprint import pprint

from tornado.options import define, options
from tornado.httpserver import HTTPServer
from tornadorpc.json import JSONRPCHandler

from kpages.router import load_handlers
from kpages.utility import refresh_config,set_default_encoding


define("rpcport", default=None, help="run on the given port", type=int)
'''
define("config", default='setting.py', help="set config for server")
define("ip",  help="bind accept ip  for server")
define("debug", default=None,  help="Debug Mode")
define("ndebug",  help="No Debug Mode")
'''

def load_rpc_handlers():
    member_filter = lambda m : isinstance(m, JSONRPCHandler) and hasattr(m, '__urls__') and m.__urls__
    return load_handlers(__conf__.RPC_DIR)


def start_server():
    settings = {"debug": __conf__.DEBUG}
    handlers = load_rpc_handlers()
    callback(handlers)
    app = tornado.web.Application(handlers, **settings)


    if __conf__.DEBUG:
        app.listen(__conf__.PORT, address=__conf__.BIND_IP, max_buffer_size = __conf__.max_buffer_size)
    else:
        server = HTTPServer(app, xheaders=True, max_buffer_size = __conf__.max_buffer_size)
        server.bind(__conf__.PORT, address= __conf__.BIND_IP )
        server.start(0)

    loop_instance = tornado.ioloop.IOLoop.instance()
    for (route, handler) in handlers:
        try:
            setattr(handler, '_server', loop_instance)
        except AttributeError:
            handler._server = loop_instance
    
    loop_instance.start()
    return loop_instance
        



def run():
    set_default_encoding()
    tornado.options.parse_command_line()
    opts = options
    refresh_config(opts.config)

    __conf__.PORT = opts.rpcport or __conf__.RPC_PORT
    __conf__.DEBUG = opts.debug or __conf__.DEBUG
    __conf__.BIND_IP = opts.ip or __conf__.BIND_IP
    
    start_server()
    

def callback(handlers):
    settings = __conf__.__dict__
    print "Start time: {0}".format(datetime.now().isoformat(" "))
    print "Config Params"
    for k in sorted(settings.keys()):
        if k.startswith("__"):
            continue
        print "  {0:<40} : {1}".format(k, settings[k])
    
    print
    print "RPC Router Handlers"
    for h in handlers:
        print '  {0:<50} : {1}'.format(h[1],h[0])

if __name__ == "__main__":
    try:
        run()
    except KeyboardInterrupt:
        print 'exit server '

# vim: ts=4 sw=4 sts=4 expandtab
