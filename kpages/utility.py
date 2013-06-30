# -*- coding:utf-8 -*- 
"""
    author comger@gmail.com
"""
import os
import __builtin__
from types import ModuleType
from bson.objectid import ObjectId

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
    if not args:args = ("setting.py.txt",)
    
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


def mongo_conv(d):
    if isinstance(d, (unicode, ObjectId)):
        return str(d)
    elif isinstance(d, (list, tuple)):
        return [mongo_conv(x) for x in d]
    elif isinstance(d, dict):
        return dict([(mongo_conv(k), mongo_conv(v)) for k, v in d.items()])
    else:
        return d

__all__ = ["app_path","not_empty","refresh_config","mongo_conv"]
