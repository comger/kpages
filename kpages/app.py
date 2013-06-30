#!/usr/bin/env python
# -*- coding:utf-8 -*- 
"""
    author comger@gmail.com
"""
import tornado.web
import tornado.ioloop

from router import load_handlers

from utility import refresh_config,app_path

def run():
    refresh_config('setting.py')
    print 
    print 'ConfigParams:'
    for k,v in __conf__.__dict__.items():
        if not k.startswith('__'):
            print "  {0:<20} : {1}".format(k, v)
    
    dirs = __conf__.ACTION_DIR
    if isinstance(__conf__.ACTION_DIR, str):dirs = (__conf__.ACTION_DIR,)

    handlers = []
    for path in dirs:
        handlers.extend(load_handlers(path))
    
    print 
    print "UrlHandlers:"
    for h in handlers:
        print h

    

    settings = {"debug":__conf__.DEBUG,
            "static_path":app_path(__conf__.STATIC_DIR_NAME),
            "template_path":app_path(__conf__.TEMPLATE_DIR_NAME),
            "gzip":__conf__.GZIP,
            "cookie_secret":__conf__.COOKIE_SECRET,
            "xsrf_cookies":__conf__.XSRF_COOKIES}
    app = tornado.web.Application(handlers,**settings)
    app.listen(__conf__.PORT)
    tornado.ioloop.IOLoop.instance().start()

__all__ = ["run"]
