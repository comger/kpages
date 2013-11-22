# -*- coding:utf-8 -*-
"""
    author comger@gmail.com
"""
import os
import datetime
import __builtin__
from types import ModuleType
from bson.objectid import ObjectId
from fnmatch import fnmatch
from inspect import getmembers

#merge f with current path
app_path = lambda f: os.path.join(os.getcwd(), f)


def get_modules(m_path):
    ''' get all py module in m_path '''
    path = app_path(m_path)
    py_filter = lambda f: fnmatch(f, '*.py') and not f.startswith('__')
    names = [os.path.splitext(n)[0] for n in os.listdir(path) if py_filter(n)]
    return [__import__("{0}.{1}".format(m_path, n)).__dict__[n] for n in names]


def _get_members(m_path, member_filter=None, in_module=None):
    ''' get all members in m_path for member_filter'''
    modules = get_modules(m_path)
    if not member_filter:
        member_filter = lambda m: isinstance(m, type)

    if in_module:
        m = __import__("{0}.{1}".format(m_path, in_module)).__dict__[in_module]
        return dict(("{0}.{1}".format(v.__module__, k), v) for k, v in getmembers(m, member_filter))

    ret = {}
    for m in modules:
        members = dict(("{0}.{1}".format(
            v.__module__, k), v) for k, v in getmembers(m, member_filter))
        ret.update(members)
    return ret


def get_members(dirs, member_filter=None):
    if isinstance(dirs, str):
        dirs = (dirs,)

    ms = {}
    for path in dirs:
        ms.update(_get_members(path,member_filter=member_filter))
    
    return ms


def not_empty(*args):
    if not all(args):
        raise ValueError("Argument must be not None/Null/Zero/Empty!")


def reflesh_config(*args):
    '''
        刷新当前环境配置 保存到__builtin__
        *args:相对目录的文件列表
        demo: reflesh_config('setting.py.txt','cacheconfig.py.txt')
        use like : __conf__.DB_HOST
    '''
    if not args:
        args = ()

    dct = {}
    import settings
    dct.update(settings.__dict__)

    pys = map(app_path, args)
    for py in pys:
        if os.path.exists(py):
            execfile(py, dct)

    module = ModuleType("__conf__")
    for k, v in dct.items():
        if not k.startswith("__"):
            setattr(module, k, v)

    __builtin__.__conf__ = module


def mongo_conv(d):
    if isinstance(d, (ObjectId, datetime.datetime)):
        return str(d)
    elif isinstance(d,(unicode,)):
        return str(d.encode('utf-8'))
    elif isinstance(d, (list, tuple)):
        return [mongo_conv(x) for x in d]
    elif isinstance(d, dict):
        return dict([(mongo_conv(k), mongo_conv(v)) for k, v in d.items()])
    else:
        return d


def set_default_encoding():
    import sys
    import locale
    reload(sys)

    lang, coding = locale.getdefaultlocale()
    if not coding:
        coding = 'utf-8'

    sys.setdefaultencoding(coding)

__all__ = ["app_path", "not_empty", "reflesh_config", "mongo_conv",
           "set_default_encoding", "get_modules", "get_members"]
