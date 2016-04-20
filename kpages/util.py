#encoding=utf8
import os
import time
from datetime import datetime
from bson.objectid import ObjectId
from kpages import get_context, mongo_conv, not_empty

def Tb(table,dbname=None):
    return get_context().get_mongoclient(dbname)[table]

def m_insert(table, **kwargs):
    """
        简单保存数据
    """
    dbname = None
    if 'dbname' in kwargs:
        dbname=kwargs.pop('dbname')

    return str(Tb(table, dbname=dbname).insert(kwargs))


def m_find_one(table, fields=None, **kwargs):
    """
        查询单条记录
        fields 指定需要输出的字段 like {'name':1}
    """
    dbname = None
    if 'dbname' in kwargs:
        dbname=kwargs.pop('dbname')

    return mongo_conv(Tb(table, dbname=dbname).find_one(kwargs, fields)) or {}

def m_count(table, **kwargs):
    """
        求数量
    """
    dbname = None
    if 'dbname' in kwargs:
        dbname=kwargs.pop('dbname')

    return Tb(table, dbname=dbname).find(kwargs).count()

def m_list(table, fields=None, sorts = None, **kwargs):
    """
        列表查询
        fields 指定需要输出的字段 like {'name':1}
    """
    dbname = None
    if 'dbname' in kwargs:
        dbname=kwargs.pop('dbname')

    #if not sorts:
    #    sorts = [('_id', 1)]

    page_index = int(kwargs.pop('page_index', 1))
    page_size = int(kwargs.pop('page_size', 10))
    findall = kwargs.pop('findall', None)

    tb = Tb(table, dbname = dbname)
    count = tb.find(kwargs).count()
    if count and findall in [1, '1', True]:
        page_index = 1
        page_size = count

    page_num = (count + page_size - 1)/ page_size
    page = dict(page_index = page_index, page_size = page_size, page_num = page_num,allcount=count)

    if sorts:
        ret = mongo_conv(list(tb.find(kwargs, fields).sort(sorts).skip((page_index - 1) * page_size).limit(page_size)))
    else:
        ret = mongo_conv(list(tb.find(kwargs, fields).skip((page_index - 1) * page_size).limit(page_size)))


    return ret, page


def m_del(table, **kwargs):
    dbname = None
    if 'dbname' in kwargs:
        dbname=kwargs.pop('dbname')

    Tb(table, dbname=dbname).remove(kwargs)
    return True

def m_update(table, query, upsert = False, **kwargs):
    """
        简单更新逻辑
    """
    dbname = None
    if 'dbname' in kwargs:
        dbname=kwargs.pop('dbname')

    Tb(table, dbname=dbname).update(query, {'$set': kwargs}, upsert = upsert, multi = True)
    return True

def m_update_original(table, query, doc, upsert = False, **kwargs):
    """
        复杂自定义更新逻辑
    """
    dbname = None
    if 'dbname' in kwargs:
        dbname=kwargs.pop('dbname')

    Tb(table, dbname=dbname).update(query, doc, upsert = upsert, multi = True)
    return True

def m_unset(table, query, fields, **kwargs):
    """
        fields: ['col1', 'col2']
    """
    dbname = None
    if 'dbname' in kwargs:
        dbname=kwargs.pop('dbname')

    unset = {}
    for item in fields:
        unset[item] = 1

    Tb(table, dbname=dbname).update(query, {'$unset': unset}, multi = True)
    return True

def m_addToSet(table, query, upsert = False, **kwargs):
    """
        追加列表
    """
    dbname = None
    if 'dbname' in kwargs:
        dbname=kwargs.pop('dbname')

    Tb(table, dbname=dbname).update(query, {'$addToSet': kwargs}, upsert = upsert)
    return True

def m_pull(table, query, **kwargs):
    """
        追加列表
        fields: {字段: 值}
    """
    dbname = None
    if 'dbname' in kwargs:
        dbname=kwargs.pop('dbname')

    Tb(table, dbname=dbname).update(query, {'$pull': kwargs})
    return True

def m_group(table, key, cond, initial, func,  **kwargs):
    """
    """
    dbname = None
    if 'dbname' in kwargs:
        dbname=kwargs.pop('dbname')

    return Tb(table, dbname=dbname).group(key, cond, initial, func, **kwargs)

def m_distinct(table, key, query = {}, **kwargs):
    dbname = None
    if 'dbname' in kwargs:
        dbname=kwargs.pop('dbname')

    return Tb(table, dbname=dbname).find(query).distinct(key)

def init_page(page):
    start, end = 1, page.get('page_num')

    page_index = int(page.get('page_index', '1'))
    page_num = int(page.get('page_num'))

    if page_index >5:
        start = page_index - 5

    if end >= 10:
        end = start +9

    if end > page_num:
        end = page_num
        start = page_num - 9

    page['start'] = start
    page['end'] = end

    return page


