# -*- coding:utf-8 -*-
"""
    author comger@gmail.com
    mongodb 时序数据优化存储及查询
    功能清单：
    1. 保存数据
    2. 数据分组聚合
    3. 数据压缩存储
    5. 快速缩放数据查询
"""
from datetime import datetime
from kpages import get_context
from util import *

def _exists(table, day, dbname = None,**kwargs):
    if not type(day) == float:
        raise Exception('day type is not float')
    
    kwargs.update(day=day)
    return m_count(table,**kwargs) > 0

def parse_ts(ts):
    dtime = datetime.fromtimestamp(ts)
    day = datetime(dtime.year,dtime.month,dtime.day)
    ta = (dtime - day).total_seconds()
    day_stamp = ts-ta
    return day_stamp,ta

def init_table(table, day, dbname = None, **kwargs):
    coll = Tb(table, dbname=dbname)    
    if not type(day) in (float,int):
        raise Exception('day type is not float or int')
    
    kwargs.update(day=day,count=0,data={})
    coll.insert(kwargs)

def insert(table, day, seconds, val, dbname=None, **kwargs):
    if not type(day) in (float, int):
        raise Exception('day type is not float or int')
    
    if not type(seconds) in (float,int):
        raise Exception('seconds type is not float or int ')

    cond = dict(day=day)
    cond.update(**kwargs)

    data = {'data.{0}'.format(seconds):val}
    m_update(table, cond, dbname=dbname, **data) 

    
def aggregate(table,start,end, dbname,**kwargs):
    match = {'$gte':start,'$lte':end}
    match.update(kwargs)

    cond = {
        "$match":match,
        "$group":{
            'vs':{'$push':'data'}
        }
    }
    Tb(table,dbname=dbname)
    
    

