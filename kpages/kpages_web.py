#!/usr/bin/env python
# -*- coding:utf-8 -*-
"""
    author comger@gmail.com
"""
import sys
import json

from datetime import datetime
from pprint import pprint
from kpages import run

def callback(app):

    print "Start time: {0}".format(datetime.now().isoformat(" "))
    print "Config Params"
    for k in sorted(app.settings.keys()):
        if k.startswith("__"):
            continue
        print "  {0:<40} : {1}".format(k, app.settings[k])

    
    print
    print "UI Modules"
    for k,v in app.uimodules.items():
        print ' {0:<20} :{1}'.format(k,v.__doc__)

    print 
    print "UI  Methods"
    for k,v in app.uimethods.items():
        print ' {0:<20} :{1}'.format(k,v.__intro__)

    print
    
    print
    print "Router Handlers"
    for h in app.handlers:
        print '  {0:<50} : {1}'.format(h[1],h[0])

if __name__ == "__main__":
    try:
        run(callback)
    except KeyboardInterrupt:
        print 'exit server '

# vim: ts=4 sw=4 sts=4 expandtab
