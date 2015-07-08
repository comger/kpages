#!encoding=utf-8
import time
import threading

"""
    Cache().setex(k, v, timeout)
    Cache().get(k)
"""

HB = 10     # 检查频率 秒

class Cache(object):
    m = {}

    def __new__(cls, *args, **kw):
        if not hasattr(cls, '_instance'):
            orig = super(Cache, cls)
            cls._instance = orig.__new__(cls, *args, **kw)

            t = threading.Thread(target=cls._instance.timer)
            t.setDaemon(True)
            t.start()

        return cls._instance

    def setex(self, k, v, ex = None):
        """
            k, v, ex = expire
        """
        if ex: ex = time.time() + ex
        self.m[k] = (v, ex)

    def get(self, k):
        return self.m.get(k)[0] if self.m.has_key(k) else None

    def timer(self):
        while True:
            now = time.time()
            for k, v in self.m.items():
                if v[1] and now > v[1]:
                    self.m.pop(k, None)

            time.sleep(HB)

if __name__ == '__main__':
    Cache().setex(1, 2, 6)
    for i in range(10):
        print Cache().get(1)
        time.sleep(1)

    import tornado.ioloop
    tornado.ioloop.IOLoop.instance().start()



