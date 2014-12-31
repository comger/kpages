# -*- coding:utf-8 -*-
"""
    author comger@gmail.com
    tornado argunment model tool
    to easy fetch argument, varlid and convert to system type
"""
import re
import time

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
        _field = dict(
            name = CharField(label='username',required=True),
            sex = BooleanField(),
            age = IntField()
        )
    """
    _fields = {}

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
    
