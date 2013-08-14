# -*- coding:utf-8 -*- 
"""
    test for spider module
    author comger@gmail.com
"""
import tornado
import urllib2
from unittest import TestCase
from spiders import spiderloader

class SpiderCase(TestCase):
    
    def setUp(self):
        pass

    def test_getspiders(self):
        item =  spiderloader.spiders.get('baidunews',None)
        if item:
            item().page(callback=self.on_end,city='厦门',index=2)
            tornado.ioloop.IOLoop.instance().start()

    def on_end(self,data):
        print len(data)
