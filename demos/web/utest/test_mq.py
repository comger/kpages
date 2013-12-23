# -*- coding:utf-8 -*-
"""
    author comger@gmail.com
"""
import json
from kpages import service_async
from unittest import TestCase

class Mq(TestCase):
    
    def test_send(self):
        service_async('demofun',{'a':'ddd','v':0.1})



