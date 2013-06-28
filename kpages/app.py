#!/usr/bin/env python
# -*- coding:utf-8 -*- 
"""
    author comger@gmail.com
"""
import tornado.web
import tornado.ioloop

from router import load_handlers

from utility import refresh_config

def run():
    refresh_config('setting.py.txt')
    print 
    print 'ConfigParams:'
    for k,v in __conf__.__dict__.items():
        if not k.startswith('__'):
            print "  {0:<20} : {1}".format(k, v)

    handlers = load_handlers('restful')
    print 
    print 'UrlHandlers'
    for h in handlers:
        print h

    

    settings = {'debug':__conf__.DEBUG}
    app = tornado.web.Application(handlers,**settings)
    app.listen(__conf__.PORT)
    tornado.ioloop.IOLoop.instance().start()


