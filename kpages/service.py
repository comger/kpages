# -*- coding:utf-8 -*-

"""
    Reids MQ Service



    作者: Q.yuhen, comger@gmail.com
    创建: 2011-08-01

    历史:
        2011-08-03  + srvcmd 装饰器
        2011-08-04  * 取消 Service callback，改为自动查找 service function。
                    + 增加 _send_pack, _unpack。
        2011-08-07  * 将 PSConsumer 从 Service 中分离。便于单元测试使用。
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
import time, sched
from log import log
import threading

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
    def unpack(data):
        try:
            pack = loads(data)
            return pack["cmd"], pack["data"]
        except:
            return 'undefined cmd', None

    @classmethod
    def async_send_pack(cls, cmd, data, channel=None):
        r = get_context().get_redis()
        pack = dumps(dict(cmd=cmd, data=data), cls=DateTimeEncoder)
        r.publish(channel or __conf__.SERVICE_CHANNEL, pack)

    @classmethod
    def async_queue(cls, cmd, data, channel=None):
        r = get_context().get_redis()
        pack = dumps(dict(cmd=cmd, data=data), cls=DateTimeEncoder)
        r.rpush(channel or __conf__.SERVICE_CHANNEL, pack)


class PSConsumer(object):
    def __init__(self, channel, host="localhost"):
        self._channel = channel
        self._host = host

    def subscribe(self):
        self._redis = Redis(host=self._host) 
        self._pubsub = self._redis.pubsub()
        self._pubsub.subscribe(self._channel)

    def consume(self):
        try:
            data = self._pubsub.listen().next()["data"]
            return Pack.unpack(data)
        except Exception as e:
            self._pubsub.subscribe(self._channel)
            return None, None


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
        self._processes = (__conf__.DEBUG and 1 or cpu_count()) * __conf__.CPU_MULTIPLE

        self._ps_consumer = PSConsumer(self._channel, self._host)
        self._services = self._get_services()

        if callback:
            kwargs = dict(
                host=self._host,
                channel=self._channel,
                processes=self._processes,
                services=self._services,
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
                    killpg(self._parent, SIGUSR1)
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
            traceback.print_exc()
            return {}


    def _queue_consumer(self):
        for i in range(self._processes):
            if not iswin:
                if fork() > 0:
                    continue

            with LogicContext():
                log_queue_consumer = log("log/service-queue-consumer", level = 'info' if not __conf__.DEBUG else 'debug')
                channel = ['REDIS_QUEUE_1', self._channel]
                r = get_context().get_redis()
                while True:
                    try:
                        channel, data = r.brpop(channel)
                        cmd, data = Pack.unpack(data)
                        srv_funcs = self._services.get(cmd, ())

                        ps = []
                        for func in srv_funcs:
                            try:
                                func(data)
                            except Exception as e:
                                log_queue_consumer.error("{}".format(traceback.format_exc()))

                    except (SystemExit, KeyboardInterrupt) as e:
                        log_queue_consumer.error("{}".format(traceback.format_exc()))
                        break;
                    except Exception as e:
                        log_queue_consumer.error("{}".format(traceback.format_exc()))
                        time.sleep(1)
                        continue

            exit(0)

    def ps_consumer(self):
        if not iswin:
            if fork() > 0:
                return

        with LogicContext():
            self._ps_consumer.subscribe()
            log_psconsumer = log("log/service-psconsumer", level = 'info' if not __conf__.DEBUG else 'debug')
            while True:
                try:
                    cmd, data = self._ps_consumer.consume()
                    srv_funcs = self._services.get(cmd, ())

                    ps = []
                    for func in srv_funcs:
                        try:
                            func(data)
                        except Exception as e:
                            log_psconsumer.error("{}".format(traceback.format_exc()))

                except (SystemExit, KeyboardInterrupt) as e:
                    log_psconsumer.error("{}".format(traceback.format_exc()))
                    break;
                except Exception as e:
                    log_psconsumer.error("{}".format(traceback.format_exc()))
                    time.sleep(1)
                    continue

            exit(0)

    def run(self):
        if not iswin:
            self._signal()

        try:
            self.ps_consumer()
            self._queue_consumer()
        except RuntimeError:
            print "Is running?"
            exit(-1)

        #添加代码改动监控
        while True:
            pause()


service_async = Pack.async_send_pack
service_async_queue = Pack.async_queue

__all__ = ["Service", "srvcmd", "service_async", "srvtimer", "service_async_queue"]

