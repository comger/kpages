"""
author comger@gmail.com
mongodb 异步操作辅助模块
特性
1. 允许在一个应用中同时允许连接多个数据库(host, dbname)
2. 便捷支持异步操作, 并可用于tornado
3. 在单元测试中与web 中都可以正常使用配置文件中的配置

tutorial

doc = await m_util.m_find_one(table,  **{'_id':1})
"""
import datetime
import motor.motor_tornado
from bson import ObjectId, SON


def mongo_conv(d):
    if isinstance(d, (ObjectId, datetime.datetime, datetime.date)):
        return str(d)
    elif isinstance(d, list):
        return [mongo_conv(i) for i in d]
    elif isinstance(d, tuple):
        return tuple(map(mongo_conv, d))
    elif isinstance(d, dict):
        return dict([(mongo_conv(k), mongo_conv(v)) for k, v in d.items()])
    else:
        return d


def init_page(page):
    start, end = 1, page.get('page_num')

    page_index = int(page.get('page_index', '1'))
    page_num = int(page.get('page_num'))

    if page_index > 5:
        start = page_index - 5

    if end >= 10:
        end = start + 9

    if end > page_num:
        end = page_num
        start = page_num - 9

    page['start'] = start
    page['end'] = end

    return page


def get_motor(**kwargs):
    """ 获取Mongo Motor 连接 """
    dbname = __conf__.DB_NAME
    if 'dbname' in kwargs:
        dbname = kwargs.pop('dbname')

    host = kwargs.pop('host', __conf__.DB_HOST)
    client = motor.motor_tornado.MotorClient(f'mongodb://{host}')
    return client[dbname], kwargs


def get_tb(table, **kwargs):
    """ 获取 Motor mongodb collection """
    db, kwargs = get_motor(**kwargs)
    return db[table], kwargs


async def m_count(table, **kwargs):
    """统计数据记录数量 """
    tb, kwargs = get_tb(table, **kwargs)
    return await tb.count_documents(kwargs)


async def m_insert(table, **kwargs):
    """ 简单插入 """
    tb, kwargs = get_tb(table, **kwargs)
    doc = await tb.insert_one(kwargs)
    return str(doc.inserted_id)


async def m_insert_many(table, lst, **kwargs):
    """ 批量插入 """
    tb, kwargs = get_tb(table, **kwargs)
    await tb.insert_many(lst)



async def m_find_one(table, fields=None, **kwargs):
    """ 获取单条数据记录 """
    tb, kwargs = get_tb(table, **kwargs)
    obj = await tb.find_one(kwargs, fields)
    return mongo_conv(obj) or {}


async def m_del(table, fields=None, **kwargs):
    """ 删除数据记录 """
    tb, kwargs = get_tb(table, **kwargs)
    await tb.delete_many(kwargs)
    return True


async def m_list(table, fields=None, sorts=None, **kwargs):
    """ 获取数据记录 """
    page_index = int(kwargs.pop('page_index', 1))
    page_size = int(kwargs.pop('page_size', 10))
    findall = kwargs.pop('findall', None)

    tb, kwargs = get_tb(table, **kwargs)
    count = await tb.count_documents(kwargs)
    if count and findall in [1, '1', True]:
        page_index = 1
        page_size = count

    page_num = (count + page_size - 1) / page_size
    page = dict(page_index=page_index, page_size=page_size, page_num=page_num, allcount=count)
    if sorts:
        lst = await tb.find(kwargs, projection=fields).sort(sorts).skip((page_index - 1) * page_size).to_list(length=page_size)
    else:
        lst = await tb.find(kwargs, projection=fields).skip((page_index - 1) * page_size).to_list(length=page_size)

    init_page(page)
    return mongo_conv(lst), page


async def m_aggregate(table, pipeline, **kwargs):
    """ aggregate """
    db, kwargs = get_motor(**kwargs)
    plan = await db.command(SON([("aggregate", table), ("pipeline", pipeline)]))
    return plan


async def m_distinct(table, key, **kwargs):
    """ distinct """
    tb, kwargs = get_tb(table, **kwargs)
    return await tb.distinct(key, filter=kwargs)


async def m_update(table, query, upsert = False, **kwargs):
    """简单更新逻辑"""
    tb, kwargs = get_tb(table, **kwargs)
    multi = kwargs.pop('multi', False)
    if multi:
        await tb.update_many(query, {'$set': kwargs})
    else:
        await tb.update_one(query, {'$set': kwargs}, upsert = upsert)

    return True


async def m_update_original(table, query, doc, upsert = False, **kwargs):
    """
        复杂自定义更新逻辑
    """
    tb, kwargs = get_tb(table, **kwargs)
    await tb.replace_one(query, doc, upsert = upsert)
    return True


async def m_unset(table, query, fields, **kwargs):
    """ 删除字段
        fields:[f,f2]
    """
    unset = {}
    for item in fields:
        unset[item] = 1
    tb, kwargs = get_tb(table, **kwargs)
    await tb.update(query, {'$unset': unset}, multi = True)
    return True


async def m_add_to_set(table, query, upsert=False, **kwargs):
    """ 追加列表 """
    tb, kwargs = get_tb(table, **kwargs)
    await tb.update(query, {'$addToSet': kwargs}, upsert = upsert)
    return True

async def m_pull(table, query, **kwargs):
    """ 
    追加列表
    fields: {字段: 值}
    """
    tb, kwargs = get_tb(table, **kwargs)
    await tb.update(query, {'$pull': kwargs})
    return True

async def m_group(table, key, cond, initial, func,  **kwargs):
    """group """
    tb, kwargs = get_tb(table, **kwargs)
    return await tb.group(key, cond, initial, func, **kwargs)

async def m_map_reduce(table, m, r, output, **kwargs):
    """ map reduce """
    tb, kwargs = get_tb(table, **kwargs)
    return await tb.map_reduce(m, r, output, **kwargs)


