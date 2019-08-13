# -*- coding:utf-8 -*-
"""
    auto doc tools
    author comger@gmail.com
    function:
        kpages_init.py --doc all     : doc all case for app
    demos:
        kpages_init.py --doc all                          :doc methods in app's __conf__.UTEST_DIR

    doc dir is config in __conf__.UTEST_DIR
"""
import os
import sys
import profile
from fnmatch import fnmatch
from inspect import isclass, ismethod, getmembers

from kpages.utility import _get_members, app_path
from kpages.router import load_handlers


def _load_api(handler_dir='action', member_filter=None):
    '''
    Load handler's url api 
    '''
    path = app_path(handler_dir)
    sys.path.append(os.getcwd())
    py_filter = lambda f: fnmatch(f, '*.py') and not f.startswith('__')

    if not member_filter:
        member_filter = lambda m: isinstance(
            m, type) and hasattr(m, '__urls__') and m.__urls__

    names = [os.path.splitext(n)[0] for n in os.listdir(path) if py_filter(n)]
    modules = [__import__(
        "{0}.{1}".format(handler_dir, n)).__dict__[n] for n in names]

    mts = ('get', 'post', 'put', 'patch', 'delete')

    rets = []
    for m in modules:        
        apis = []
        doc = {'module': m, 'apis':apis}

        for k, v in getmembers(m, member_filter):
            
            print(k, v, v.__module__)
            for _method in mts:
                _mt = getattr(v, _method)
                #import pdb;pdb.set_trace()
                #todo if method in private for subclass 
                if _mt and _mt.__doc__:
                    mt_doc = dict(method=_method, url=v.__urls__, doc=_mt.__doc__, func=_mt)
                    apis.append(mt_doc)

        rets.append(doc)
    return rets

def load_api(handler_dir='action', member_filter=None):
    ''' load all handler in dirs '''
    dirs = handler_dir
    if isinstance(handler_dir, str):
        dirs = (handler_dir,)
    handlers = []
    for path in dirs:
        handlers.extend(_load_api(path, member_filter=member_filter))

    return handlers


def api2markdown(rets):
    ''' api to markdown '''
    header = """
## {0}
模块说明 {1}
### 接口清单
"""

    api_format = """
{0}. [{1}] {2}
```
{3}
```
    """

    doc = ''
    num = 1
    for _doc in rets:
        _header = header.format(_doc['module'].__name__, str(_doc['module'].__doc__).replace('\t',''))
        for api in _doc['apis']:
            pre_url = [ url[0] for url in api['url']]
            _header = _header+api_format.format(num,api['method'].upper(), ','.join(pre_url), str(api['doc']).replace('\t',''))
            num = num +1
        
        doc = doc + _header
    
    
    f = open(app_path('apis.md'),'w')
    f.write(doc)
    f.close()

def run_doc(line=None):
    _handlers = load_api(__conf__.ACTION_DIR)
    api2markdown(_handlers)
    print('auto gen apis.md done!')


__all__ = ['run_doc']
