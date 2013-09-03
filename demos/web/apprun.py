#!/usr/bin/env python
# -*- coding:utf-8 -*- 
"""
    author comger@gmail.com
"""
import sys

from kpages import run

def callback(app):
    print app

if __name__ == "__main__":
    run(callback)
