import Queue
import sys
import threading
import traceback

class ThreadPoolWorker(threading.Thread):
    def __init__(self, pool):
        threading.Thread.__init__(self)
        self.pool = pool
        self.daemon = True

    def run(self):
        while not self.pool.stopping:
            func, args, kwargs, callback = self.pool._queue.get()
            try:
                rv = func(*args, **kwargs)
                if callback: callback(rv)
            except:
                traceback.print_exc()
            self.pool.task_done()
        self.pool.worker_done()
        
class ThreadPool(object):
    __instance = None
    def __init__(self, size, name):
        self.stopping = False 
        self.active_workers = 0
        self.name = name
        self.unfinished_tasks = 0
        self.mutex = threading.Lock()
        self.all_tasks_done = threading.Condition(self.mutex)

        self._queue = Queue.Queue()
        self._workers = []
        for i in range(size):
            worker = ThreadPoolWorker(self)
            worker.setName('%s-%d' % (name, i))
            self._workers.append(worker)

    def task_add(self, func, args = [], kwargs = {}, callback = None):
        self.mutex.acquire()
        try:
            self.unfinished_tasks+=1
            self._queue.put((func, args, kwargs, callback))
        finally:
            self.mutex.release()

    add_task = task_add

    def task_done(self):
        self.all_tasks_done.acquire()
        try:
            self.unfinished_tasks-=1
            if self.unfinished_tasks == 0:
                self.all_tasks_done.notify_all()
        finally:
            self.all_tasks_done.release()

    def worker_done(self):
        self.mutex.acquire()
        self.active_workers-=1
        self.mutex.release()

    def start(self):
        for w in self._workers:
            w.start()
            self.mutex.acquire()
            self.active_workers+=1
            self.mutex.release()

    def join(self):
        self.all_tasks_done.acquire()
        try:
            while self.unfinished_tasks:
                self.all_tasks_done.wait(0.1)
        finally:
            self.all_tasks_done.release()

    @classmethod
    def getinstance(cls, size = 5, name = "tp"):
        if cls.__instance == None:
            cls.__instance = ThreadPool(size, name)
            cls.__instance.start()

        return cls.__instance

if __name__ == '__main__':
    def cb(*args, **kwargs):
        print 'response:', args, kwargs

    def func(username, password, **kwargs):
        print 'in func', username, password, kwargs
        return 'func', username, password, 'done'

    pool = ThreadPool.getinstance(size=10)
    pool.add_task(func, args = ['zhangxj', '666666'], kwargs = {'a': 1}, callback = cb)
    pool.add_task(func, args = ['zhangxj', '666666'], kwargs = {'a': 1}, callback = cb)
    pool.add_task(func, args = ['zhangxj', '666666'], kwargs = {'a': 1}, callback = cb)
    pool.add_task(func, args = ['zhangxj', '666666'], kwargs = {'a': 1}, callback = cb)

    import tornado.ioloop
    tornado.ioloop.IOLoop.instance().start()

