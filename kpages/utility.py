#!/usr/bin/env python
# -*- coding:utf-8 -*- 
"""
    author comger@gmail.com
"""
import os
import __builtin__
from types import ModuleType

#merge f with current path
app_path = lambda f:os.path.join(os.getcwd(),f)

def not_empty(*args):
    if not all(args):
        raise ValueError("Argument must be not None/Null/Zero/Empty!")

def refresh_config(*args):
    '''
        刷新当前环境配置 保存到__builtin__
        *args:相对目录的文件列表
        demo: refresh_config('setting.py.txt','cacheconfig.py.txt')
        use like : __conf__.DB_HOST 
    '''
    if not args:args = ('setting.py.txt',)
    
    dct = {}
    import settings
    dct.update(settings.__dict__)
    
    pys = map(app_path,args)
    for py in pys:
        if os.path.exists(py):execfile(py, dct)

    module = ModuleType("__conf__")
    for k, v in dct.items():
        if not k.startswith("__"):setattr(module, k, v)

    __builtin__.__conf__ = module


