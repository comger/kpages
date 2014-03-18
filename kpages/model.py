# -*- coding:utf-8 -*-
"""
    author comger@gmail.com
    tornado mongodb model tool
    help you easy to manage mongodb data by tornado request(cu-rd)
"""
import time
from bson import ObjectId
from context import get_context

class Field(object):
    """
    Field Base Class
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
    _field = dict(
        name = CharField(label='username',required=True),
        sex = BooleanField(),
        age = IntField()
    )
'''
class Model(object):
    
    #对应mongodb collection 名称
    _name = None
    _fields = {}

    def _get_fields(self):
        """get all fields  in model"""
        for f in self._fields.keys():
            if not self._fields[f].label:
                self._fields[f].label = f

        return self._fields
    
    def _get_postdata(self, **kwargs):
        """ fill fields value """
        data = kwargs
        try:
            for key,field in self._get_fields().items():
                if hasattr(field,'datatype') and isinstance(field, ListField):
                    vals = self.get_arguments(key,())
                    data[key] = field.val(vals)
                    continue
                
                val = self.get_argument(key,data.get(key,None))
                if field.required and not val:
                    raise Exception('field {0} is required'.format(key))
                elif not val:
                    data[key] = field.initial
                else:
                    data[key] = field.val(val)

        except Exception as e:
            raise Exception('{0} in Model {1}'.format(e.message, self._name))

        return data

    def _save(self, db=None, cond={}, **kwargs):
        """ No longer supported """
        try:
            db = db or get_context().get_mongoclient()
            data = self._get_postdata()
            data.update(kwargs)
        except Exception as e:
            return False,e

        if not cond:
            data['_id'] = str(db[self._name].insert(data))
            return data

        db[self._name].update(cond,{'$set':data})
        return True,data
   
   def page(self, page=1, size=10, sort=None, **kwargs):
       """ page list  """
       if 'db' in kwargs:
           db = kwargs.pop('db') or get_context().get_mongoclient()
       return db[self._name].find(kwargs).skip(size*page).limit(size).sort(sort)
