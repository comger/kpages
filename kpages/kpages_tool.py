#!/usr/bin/env python
# -*- coding:utf-8 -*-
"""
    author comger@gmail.com
"""
import tornado.ioloop

from optparse import OptionParser
from kpages import LogicContext, run_test, pro_test, reflesh_config, set_default_encoding


def _get_opt():
    parser = OptionParser("%prog [options]", version="%prog v0.9")
    parser.add_option("--config", dest="config",
                      default='setting.py', help="config for app")
    parser.add_option("--test", dest="test", default=None, help="utest module")
    parser.add_option(
        "--pro", dest="pro", default=None, help="profile for method")
    return parser.parse_args()

if __name__ == "__main__":
    try:
        set_default_encoding()
        opts, args = _get_opt()
        reflesh_config(opts.config)

        if opts.test is not None:
            m = opts.test
            if m == 'all':
                m = None
            with LogicContext():
                run_test(m)

        elif opts.pro is not None:
            with LogicContext():
                pro_test(opts.pro)

        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        print 'exit tool '

# vim: ts=4 sw=4 sts=4 expandtab
