#kpages

######kpages is mini helper for tornado,Contains the address routing management,tornado and app config management, mongodb, redis connection management and other functions; these things can help you quickly build a web application.

######基于Tornado的开发包，提供地址路由、配置、测试、性能分析、数据库及内存连接上下文管理等，如果你想用Tornado提供一些高性能的服务接口，这会给你很大的帮助的。


## 使用案例
* [Migrant 回归线](https://github.com/comger/migrant)


##如何使用kpages 创建项目

```
    1. 复制 demos/web， 创建一个新的项目。
    2. 在Settings.py 里指定你的RequestHandler 目录， 默认为目录 action （设置后，软件会自己处理添加 url 的 RequestHandler）
```

## kpages web 服务启动方式
```
python apprun.py  或 ./apprun.py
可配置参数
     config=CONFIG  set config for server
     port=PORT      set http port for server
     debug          Debug mode.
     ndebug         No Debug mode.
```

## kpages mq 服务启动方式
```
python service.py  或 ./service.py
可配置参数
     config=CONFIG  set config for server
     port=PORT      set http port for server
     debug          Debug mode.
     ndebug         No Debug mode.
     channel        set channel for redis mq
```

##router

restful/index.py(add @url to class , kpages will route url to this handler)
```
from kpages import url

@url(r'/',0)
@url(r'/home',2)
class HomeHandler(RequestHandler):
    def get(self):
        self.write('hello word')

```

setting.py(config for tornado and you app, use __conf__.xxxx to get you config value )
```
ACTION_DIR = 'restful'
DEBUG = True
PORT= 8989
```

app.py

```
from kpages import run

def callback(app):
    pass

if __name__ == '__main__':
    run(callback)
```

How to use mongo and redis context?
```
from kpages import get_context, LogicContext,mongo_conv

with LogicContext():
    db = get_context().get_mongo()
    cache = get_context().get_redis()
    lst = list(db['table'].find().limit(10))
    lst = mongo_conv(lst)

```
How to use context in hander?
```
from kpages import ContextHandler

@url(r'/context/demo')
class DemoHandler(ContextHandler,tornado.web.RequestHandler):
    def get(self):
        db = get_context().get_mongo('dbname')
        val = self.session(key)
        self.session(key,val)
```
test commend
```
run_test(test_city.DemoCase.testprint) :test testprint method
run_test(test_city.DemoCase)           :test methods in DemoCase class
run_test(test_city)                    :test methods in test_city.py
run_test(all )                         :test methods in app's __conf__.UTEST_DIR
```

pro commend
```
pro_test(test_city.DemoCase.testprint) :profile testprint method
pro_test(test_city.DemoCase)           :profile methods in DemoCase class
pro_test(test_city)                    :profile methods in test_city.py
pro_test(all)                          :profile methods in app's __conf__.UTEST_DIR

```


