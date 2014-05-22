# -*- coding:utf-8 -*-
"""
    author comger@gmail.com
    tornado mongodb model tool
    help you easy to manage mongodb data by tornado request(cu-rd)
"""
import re
import time
import traceback
from inspect import isclass
from bson import ObjectId
from context import get_context
from utility import mongo_conv,not_empty,get_members

class Field(object):
    """
    Field Base Class
    """
    required,initial,pattern = False,None,''

    def __init__(self, label=None, initial=None, required=False, description=None, pattern='', **kwargs):
        self.required = required or self.required
        self.label = label
        self.initial = initial or self.initial
        self.description = description 
        self.pattern = re.compile(pattern or self.pattern)

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

    

class Model(object):
    """
    class DemoModel(Model):
        _name = 'demomodel'
        _field = dict(
            name = CharField(label='username',required=True),
            sex = BooleanField(),
            age = IntField()
        )
    """
    #对应mongodb collection 名称
    _dbname = None
    _name = None
    _fields = {}
    
    def __init__(self, dbname=None):
        self._dbname = dbname or self._dbname
        self._dbname = self._dbname or __conf__.DB_NAME

    def _get_fields(self):
        """get all fields  in model"""
        for f in self._fields.keys():
            if not self._fields[f].label:
                self._fields[f].label = f

        return self._fields
    
    def fetch_data(self, handler=None, **kwargs):
        """ fill fields value """
        handler = handler or self
        data = kwargs
        try:
            for key,field in self._get_fields().items():
                if hasattr(field,'datatype') and isinstance(field, ListField):
                    vals = handler.get_arguments(key,())
                    data[key] = field.val(vals)
                    continue
                
                val = handler.get_argument(key,data.get(key,None))
                if field.required and not val:
                    raise Exception('field {0} is required'.format(key))
                elif not val:
                    if field.initial:
                        data[key] = field.initial
                else:
                    if field.pattern and not field.pattern.match(val):
                        raise Exception('field {0}:{1} is not matched by {2}'.format(key,val,field.pattern.pattern))
                    else:
                        data[key] = field.val(val)

        except Exception as e:
            raise Exception('{0} in Model {1}'.format(e.message, self._name))

        return data
    
    def _coll(self):
        return get_context().get_mongoclient(self._dbname)[self._name]
   
    def save(self, obj={}, **kwargs):
        obj.update(kwargs)
        _id = None
        if '_id' in obj:_id = obj.pop('_id')

        if _id:
            return self.update(_id, **obj)
        else:
            return self.insert(obj)

    def insert(self, obj={}, **kwargs):
        """ insert obj and kwargs to _name  """
        obj.update(kwargs)
        _id  = str(self._coll().insert(obj))
        return _id
       
    def update(self, _id, key='_id', **kwargs):
        ''' update record by _id'''
        not_empty(_id)
        if key == '_id':
            _id = ObjectId(_id)
           
        cond = {key:_id}
        return self._coll().update(cond, {'$set':kwargs})
    
    def remove(self, _id, key='_id', **kwargs):
        ''' remove record by _id '''
        not_empty(_id)
        if key == '_id':
            _id = ObjectId(_id)
        
        cond = {key:_id}
        cond.update(kwargs)
        return self._coll().remove(cond)
    
    def page(self, page=0, size=10, sort=None, fields=None, **kwargs):
        """ page list  """
        _sort = [('_id',-1),]
        if type(sort) == str:
            _sort.insert(0,(sort,-1))
        elif type(sort) in (list,tuple):
            _sort.insert(0,sort)

        return self._coll().find(kwargs, fields).skip(size*page).limit(size).sort(_sort)

    def info(self, _id, key='_id'):
        ''' show info by _id '''
        not_empty(_id)
        if key == '_id':
            _id = ObjectId(_id)
        
        cond = {key:_id}
        return mongo_conv(self._coll().find_one(cond))

    def exists(self, **kwargs):
        ''' is exists records find by kwargs '''
        return self._coll().find_one(kwargs)
    
    def count(self, **kwargs):
        return self._coll().find(kwargs).count()

class ModelMaster(object):
    """
    easy to load Model and select Model db
    """
    _objects = {}
    _models = {}
    
    def __init__(self, dbname=None):
        if not ModelMaster._models:
            ModelMaster._models = self.load()

        self._dbname = dbname or __conf__.DB_NAME

    def load(self):
        try:
            members = get_members(__conf__.JOB_DIR, lambda o: isclass(o) and issubclass(o,Model) and o._name)
            print members
            models = {}
            for k,v in members.items():
                models[v.__name__] = v
            
            return models
        except Exception as e:
            traceback.print_exc()
            return {}
    
    def __getattr__(self, model_name):
        key = '{0}_{1}'.format(self._dbname, model_name)
        if key in ModelMaster._objects:
            return ModelMaster._objects[key]

        if model_name not in ModelMaster._models:
            cls = Model
            cls._name = '{0}_model'.format(model_name)
        else:
            cls = ModelMaster._models[model_name]

        obj = ModelMaster._objects[key] = cls(self._dbname)
        return obj

    def __call__(self, model_name, dbname=None):
        obj =  self.__getattr__(model_name)
        obj._dbname = dbname or self._dbname 
        return obj
