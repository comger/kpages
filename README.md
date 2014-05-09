#kpages

kpages is mini helper for tornado,Contains the address routing management,tornado and app config management, mongodb, redis connection management and other functions; these supports can help you quickly build a web application.

## Case 
* [Migrant](https://github.com/comger/migrant)


## How to create kpages project (version >= 0.6.3.dev)

```
1. input command: kpages_init.py projectname # projectname: you project name, default is kpages_project
2. set you RequestHandler action dir
```

## How to start kpages web application
```
python apprun.py  or ./apprun.py
Params
     config=CONFIG  set config for server
     port=PORT      set http port for server
     debug          Debug mode.
     ndebug         No Debug mode.
     


you can run script kpages_web.py in you app root dir (version >= 0.8.0.dev)
```

## How to start kpages mq
```
python service.py  或 ./service.py
Params
     config=CONFIG  set config for server
     port=PORT      set http port for server
     debug          Debug mode.
     ndebug         No Debug mode.
     channel        set channel for redis mq

you can run script kpages_service.py in you app root dir (version >= 0.8.0.dev)
```


##How to router

restful/index.py(add @url to class , kpages will route url to this handler)
```
from kpages import url

@url(r'/',0)
@url(r'/home',2)
class HomeHandler(RequestHandler):
    def get(self):
        self.write('hello word')

```

##setting.py
```
#config for tornado and you app, use __conf__.xxxx to get you config value
ACTION_DIR = 'restful'
DEBUG = True
PORT= 8989
```

## How to use kpages app

```
from kpages import run

def callback(app):
    pass

if __name__ == '__main__':
    run(callback)
```

## How to use mongo and redis context?
```
from kpages import get_context, LogicContext,mongo_conv

with LogicContext():
    db = get_context().get_mongo()
    cache = get_context().get_redis()
    lst = list(db['table'].find().limit(10))
    lst = mongo_conv(lst)

```

## How to use context in hander( with session )?
```
from kpages import ContextHandler

@url(r'/context/demo')
class DemoHandler(ContextHandler,tornado.web.RequestHandler):
    def get(self):
        db = get_context().get_mongo('dbname')
        val = self.session(key)
        self.session(key,val)
```

## How to use model
```
class Demo(Model):
    _name = 'collection_name'
    _fields = dict(
        name = CharField(required=True),
        sex = IntField(label='sex',initial=1,required=True),
        pwd = CharField(label='password')
    )


m = Demo()
m = Demo(dbname)
master = ModelMaster()
# set dbname for Master's model
master = ModelMaster(dbname)

# get attr, this method can auto create temp model; set collection name as modelname_model
m = master.modelname

# call get attr
m = master(modelname)

# call get attr and temp dbname 
m = master(modelname,dbname)

_id = m.insert(data)
m.update(_id, c = 'acd')
obj = m.info(_id)
m.remove(_id)
cursor = m.page(page=1,size=10,**condition)

#parse requesthandler arguments to model
data = m.fetch_data(requesthandler)
data is like {'name':'youname','sex':1,'pwd':'xdssss'}
```

## test command
```
run_test(test_city.DemoCase.testprint) :test testprint method
run_test(test_city.DemoCase)           :test methods in DemoCase class
run_test(test_city)                    :test methods in test_city.py
run_test(all )                         :test methods in app's __conf__.UTEST_DIR
```

## pro command
```
pro_test(test_city.DemoCase.testprint) :profile testprint method
pro_test(test_city.DemoCase)           :profile methods in DemoCase class
pro_test(test_city)                    :profile methods in test_city.py
pro_test(all)                          :profile methods in app's __conf__.UTEST_DIR

```

## How to use  uimodule and uimethod in kpages
```
1. kpages can auto find  Ui_Module's subclass in ACTION_DIR
2. you can use {% module dir_modulename_classname() %} to call Ui Module
Demo Code
    Class Demo(tornado.web.UIModule):
        def render(self,name):
            return self.render('<h1>Hello world:{0}</h1>'.format(name))

Template code
    {% module Demo('kpages') %}
    

3. @reg_ui_method in ACTION_DIR's files, to apply Ui methods
Demo code
    
    @reg_ui_method(name='testmethod',intro='demo for ui method')
    def add(self,a,b):
        return a+b
        
Template code
    {{ add(3,4) }}
    
```


