#!/usr/bin/env python
# -*- coding:utf-8 -*-
"""
    author comger@gmail.com
    kpages tool for init project 
"""
import sys
import os
import zipfile
import kpages
from kpages import app_path

if __name__ == '__main__':
    path = 'kpages_project'
    if len(sys.argv)>1:
        path = sys.argv[1]

    root = kpages.__path__[0]
    from_path = root +'/web.zip'
    to_path = app_path(path)
    _file = zipfile.ZipFile(from_path)
    _file.extractall(to_path)
    print 'init project at:',to_path
