#!/usr/bin/env python
# -*- coding:utf-8 -*-
"""
    Request router for tornado
    author comger@gmail.com
"""
import os
import sys
import tornado.web
from fnmatch import fnmatch
from inspect import getmembers
from utility import app_path


def reg_ui_method(name=None, intro=None):
    """
    reg ui_method
    Demo
    @reg_ui_method()
    def add(self,a,b,c):
        return a+b+c

    """
    def actual(handler):
        ''' set attr for handler'''
        if not hasattr(handler, '__reg_ui__'):
            handler.__reg_ui__ = True
            handler.__uiname__ = name
            handler.__intro__ = intro

        return handler

    return actual


def url(pattern=None, order=0):
    """
    set router for RequestHandler 

    Demo:
    @url('/blog/info/(.*)')
    class ActionHandler(tornado.web.RequestHandler):
        def get(self,blogid):
            pass
    """
    def actual(handler):
        ''' set attr for handler'''
        assert(issubclass(handler, tornado.web.RequestHandler))
        if not hasattr(handler, "__urls__") or not handler.__urls__:
            handler.__urls__ = []
        
        if not pattern:
            p = '/{0}/{1}'.format(handler.__module__,handler.__name__).lower()
            p = p.replace('.','/')
            handler.__urls__.append((p, 0))
        else:
            handler.__urls__.append((pattern,order))
        
        return handler

    return actual


def load_handlers(handler_dir='action', member_filter=None):
    ''' load all handler in dirs '''
    dirs = handler_dir
    if isinstance(handler_dir, str):
        dirs = (handler_dir,)
    handlers = []
    for path in dirs:
        handlers.extend(_load_handlers(path, member_filter=member_filter))

    return handlers


def _load_handlers(handler_dir='action', member_filter=None):
    '''
        Load handler_dir's Handler
        Demo:
        handlers = load_handlers():
        app = tornado.web.Application(handlers)
    '''
    #path = os.path.join(os.getcwd(), handler_dir)
    path = app_path(handler_dir)
    sys.path.append(os.getcwd())
    py_filter = lambda f: fnmatch(f, '*.py') and not f.startswith('__')

    if not member_filter:
        member_filter = lambda m: isinstance(
            m, type) and hasattr(m, '__urls__') and m.__urls__

    names = [os.path.splitext(n)[0] for n in os.listdir(path) if py_filter(n)]
    modules = [__import__(
        "{0}.{1}".format(handler_dir, n)).__dict__[n] for n in names]

    ret = {}
    for m in modules:
        members = dict(("{0}.{1}".format(
            v.__module__, k), v) for k, v in getmembers(m, member_filter))
        ret.update(members)
    return _sorted_hanlders(ret.values())

def _sorted_hanlders(handlers):
    ''' sort handlers '''
    handlers = [(pattern, order, h) for h in handlers for pattern,
                order in h.__urls__]
    handlers.sort(cmp=cmp, key=lambda x: x[1])
    return [(pattern, handler) for pattern, _, handler in handlers]


__all__ = ["reg_ui_method", "url", "load_handlers"]
