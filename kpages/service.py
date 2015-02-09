# -*- coding:utf-8 -*-

"""
    Reids MQ Service



    作者: Q.yuhen, comger@gmail.com
    创建: 2011-08-01

    历史:
        2011-08-03  + srvcmd 装饰器
        2011-08-04  * 取消 Service callback，改为自动查找 service function。
                    + 增加 _send_pack, _unpack。
        2011-08-07  * 将 Consumer 从 Service 中分离。便于单元测试使用。
        2011-08-27  + 新增 service_async 函数。
        2011-08-28  * 重构 Pack 为一个独立类。
        2011-08-29  * 取消 Timeout。
"""
import time
import copy
import datetime
import json
import traceback
import pkgutil
from sys import stderr, argv
from multiprocessing import cpu_count, Process
import threadpool

try:
    from os import wait, fork, getpid, getppid, killpg, waitpid
    from signal import signal, pause, SIGCHLD, SIGINT, SIGTERM, SIGUSR1, SIGUSR2, SIG_IGN
    iswin = False
except:
    iswin = True
    print 'some function only support unix and linux '

from redis import Redis, ConnectionError
from json import loads, dumps

from context import LogicContext, get_context
from utility import get_members


def staticclass(cls):
    def new(cls, *args, **kwargs):
        raise RuntimeError("Static Class")

    setattr(cls, "__new__", staticmethod(new))
    return cls


def srvcmd(cmd, sub_mode=0):
    """
    sub_mode : 0 时所有消费端都可以执行，-1时，只允许其中一个消费端执行
    """
    def actual(func):
        func.__service__ = cmd
        func.__sub_mode__ = sub_mode
        return func

    return actual


def srvtimer(delay):
    def actual(func):
        func.__timer__ = delay
        return func

    return actual

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        
        return json.JSONEncoder.default(self, obj)
            

@staticclass
class Pack(object):

    @staticmethod
    def send_pack(mq, channel, cmd, data):
        sendtime = time.time()
        data['sendtime'] = str(sendtime)
        cmd_key = '{}_{}'.format(cmd, data['sendtime'])
        mq.lpush(__conf__.SERVICE_LISTKEY, cmd_key)        
        
        pack = dumps(dict(cmd=cmd, data=data), cls=DateTimeEncoder)
        mq.publish(channel, pack)

    @staticmethod
    def unpack(data):
        try:
            pack = loads(data)
            return pack["cmd"], pack["data"]
        except:
            return 'undefined cmd', None

    @classmethod
    def async_send_pack(cls, cmd, data, channel=None):
        cls.send_pack(get_context(
        ).get_redis(), channel or __conf__.SERVICE_CHANNEL, cmd, data)


class Consumer(object):
    def __init__(self, channel, host="localhost"):
        self._channel = channel
        self._host = host

    def subscribe(self):
        self._redis = Redis(host=self._host) 
        self._pubsub = self._redis.pubsub()
        self._pubsub.subscribe(self._channel)
        self._listen = None

    def consume(self):
        if not self._listen:
            self._listen = self._pubsub.listen()

        return Pack.unpack(self._listen.next()["data"])

    def close(self):
        if hasattr(self, "_redis"):
            self._redis.connection_pool.disconnect()


class Service(object):
    """
        MQ Service

        Demo:
            ./service.py [host] [channel]

            host    default "localhost"
            channel defailt  settings.py SERVICE_CHANNEL
    """
    def __init__(self, host=None, channel=None, callback=None):
        self._host = host or "localhost"
        self._channel = channel or __conf__.SERVICE_CHANNEL
        self._processes = __conf__.DEBUG and 1 or cpu_count()
        #self._processes = 1

        self._consumer = Consumer(self._channel, self._host)
        self._services = self._get_services()
        self._timer = self._get_timer()

        if callback:
            kwargs = dict(
                host=self._host,
                channel=self._channel,
                processes=self._processes,
                services=self._services,
                timers = self._timer,
                debug=__conf__.DEBUG
            )
            callback(**kwargs)

    def _signal(self):

        self._parent = getpid()
        def sig_handler(signum, frame):
            pid = getpid()

            if signum in (SIGINT, SIGTERM):
                if pid == self._parent:
                    signal(SIGCHLD, SIG_IGN)
                    killpg(self._parent, SIGUSR1)
            elif signum == SIGCHLD:
                if pid == self._parent:
                    print >> stderr, "sub process {0} exit...".format(wait())
            elif signum == SIGUSR1:
                print "process {0} exit...".format(pid == self._parent and pid or (pid, self._parent))
                exit(0)

        signal(SIGINT, sig_handler)
        signal(SIGTERM, sig_handler)
        signal(SIGCHLD, sig_handler)
        signal(SIGUSR1, sig_handler)

    def _get_services(self):
        try:
            members = get_members(
                __conf__.JOB_DIR, lambda o: hasattr(o, "__service__"))
            svrs = {}
            for k,v in members.items():
                if not svrs.get(v.__service__, None):
                    svrs[v.__service__] = []

                svrs[v.__service__].append(v)
            return svrs

        except Exception as e:
            print '服务加载失败'
            traceback.print_exc()
            return {}

    def _get_timer(self):
        try:
            members = get_members(
                __conf__.JOB_DIR, lambda o: hasattr(o, "__timer__"))
            svrs = {}
            for k,v in members.items():
                if not svrs.get(v.__timer__, None):
                    svrs[v.__timer__] = []

                svrs[v.__timer__].append(v)

            return svrs

        except Exception as e:
            print '定时任务加载失败'
            traceback.print_exc()
            return {}

    def _subscribe(self):
        self._consumer.subscribe()

        for i in range(self._processes):
            if not iswin:
                if fork() > 0:
                    continue

            with LogicContext():
                pool = threadpool.ThreadPool.getinstance(size = 10)
                while True:
                    try:
                        cmd, data = self._consumer.consume()
                        srv_funcs = self._services.get(cmd, ())

                        if cmd and data:
                            cmd_key = '{}_{}'.format(cmd, data.get('sendtime',''))
                            count = get_context().get_redis().lrem(__conf__.SERVICE_LISTKEY, cmd_key)

                        ps = []
                        for fun in srv_funcs:
                            if fun.__sub_mode__ == -1 and count==0:
                                continue

                            data = copy.deepcopy(data)
                            pool.add_task(fun, args = (data,))

                    except Exception as e:
                        import traceback
                        traceback.print_exc()
                        print cmd,e

            exit(0)

    def _corn(self):
        if not iswin:
            if fork() > 0:
                return

        with LogicContext():
            self._timer = [[time.time() + k, v, k] for k, v in self._timer.items()]
            pool = threadpool.ThreadPool.getinstance(size = 10)
            while True:
                try:
                    for no, task in enumerate(self._timer):
                        if task[0] <= time.time():
                            for fun in task[1]:
                                pool.add_task(fun)

                            task[0] = task[0] + task[2]

                    time.sleep(2)
                except ConnectionError as e:
                    import traceback
                    traceback.print_exc()
                    print 'Expception:'+e.message

        exit(0)

    def run(self):
        if not iswin:
            self._signal()

        try:
            self._subscribe()
            self._corn()
        except RuntimeError:
            print "Is running?"
            exit(-1)

        #添加代码改动监控
        while True:
            pause()


Redis.send_pack = Pack.send_pack
service_async = Pack.async_send_pack

__all__ = ["Consumer", "Service", "srvcmd", "srvtimer", "service_async"]


