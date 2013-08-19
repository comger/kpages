#!/usr/bin/env python
# -*- coding:utf-8 -*- 
"""
    author comger@gmail.com
"""
import tornado.web
import tornado.ioloop

from optparse import OptionParser, OptionGroup
from router import load_handlers
from context import LogicContext
from utility import reflesh_config,app_path,set_default_encoding
from utest import run_test,pro_test


def _get_opt():
    parser = OptionParser("%prog [options]", version="%prog v0.9")
    parser.add_option("--test", dest = "test", default = None,help = "utest module")
    parser.add_option("--pro", dest = "pro", default = None,help = "profile for method")
    
    return parser.parse_args()


def _run(*argv):
    print 
    print 'ConfigParams:'
    for k,v in __conf__.__dict__.items():
        if not k.startswith('__'):
            print "  {0:<20} : {1}".format(k, v)
    
    handlers = load_handlers(__conf__.ACTION_DIR)
    
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

def run(*argv):
    set_default_encoding()
    reflesh_config('setting.py')
    opts, args = _get_opt()
    if opts.test is not None:
        m = opts.test
        if m == 'all':m=None
        with LogicContext():
            run_test(m)
    elif opts.pro is not None:
        with LogicContext():
            pro_test(opts.pro)
    else:
        _run()

__all__ = ["run"]
