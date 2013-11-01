# -*- coding:utf-8 -*-
"""
    author comger@gmail.com
    tornado mongodb model tool
    help you easy to manage mongodb data by tornado request(cu-rd)
"""
import time
from bson import ObjectId

class Field(object):
    """
    字段基类
    """
    required,initial = False,None

    def __init__(self, label=None, initial=None, required=False, description=None,**kwargs):
        self.required = required or self.required
        self.label = label
        self.initial = initial or self.initial
        self.description = description 

    def val(self, v):
        return v


class CharField(Field):
    pass


class IntField(Field):
    initial = 0

    def val(self, v):
        return int(v)
            

class FloatField(Field):
    initial = 0.0

    def val(self, v):
        return float(v)


class ListField(Field):
    def __init__(self,datatype=CharField, *args, **kwargs):
        self.datatype = datatype
        super(ListField, self).__init__(*args, **kwargs)

    def val(self,v):
        return map(self.datatype().val,v)


class DatetimeField(Field):
    initial = time.time()
    def __init__(self,timeformat='%Y-%m-%d %H:%M:%S', *args, **kwargs):
        self.timeformat = timeformat
        super(DatetimeField, self).__init__(*args, **kwargs)
    
    def val(self, v):
        v = time.mktime(time.strptime(v, self.timeformat)) + 60*60*8
        return v

'''
use demo:
class DemoModel(Model):
    _name = 'demomodel'

    name = CharField(label='姓名',required=True)
    sex = BooleanField() 
    age = IntField()
'''
class Model(object):
    
    #对应mongodb collection 名称
    _name = None

    def _get_fields(self):
        """获取模型所有字段"""
        if hasattr(self, '_fields'):
            return self._fields

        _fields = {}
        fs = dir(self)
        for f in fs:
            _f = getattr(self,f)
            if isinstance(_f,Field):
                if not _f.label:_f.label = f

                _fields[f] = _f
        
        self._fields = _fields
        return self._fields
    
    def _get_postdata(self, args=None):
        """建立完整的数据模型"""
        data,args ={}, args or self.request.arguments
        try:
            for key,field in self._get_fields().items():
                vals = args.get(key,())
                if hasattr(field,'datatype') and issubclass(field.datatype, ListField):
                    data[key] = field.val(vals)
                    continue

                if field.required and not vals:
                    raise Exception('field {0} is required'.format(key))
                elif not vals:
                    data[key] = field.initial
                else:
                    data[key] = field.val(vals[0])
        except Exception as e:
            raise Exception('{0} in Model {1}'.format(e.message, self._name))

        return data

    def _save(self, db=None, cond={}, **kwargs):
        """创建或更新记录"""
        data = self._get_postdata()
        data.update(kwargs)
        if not cond:
            data['_id'] = str(db[self._name].insert(data))
            return data

        db[self._name].update(cond,{'$set':data})
        return data
    
