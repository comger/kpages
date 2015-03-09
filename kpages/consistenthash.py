# -*- coding:utf-8 -*-
"""
    author comger@gmail.com
    Consisten hash 
"""
from hashlib import md5
from bisect import bisect_right

class ConsistentHash(object):
    """
    算法思路：
    1. 在N个机器中、每台M个节点、N*M 个节点形成节点环
    2. 计算每个机器拥有的节点Node
    3. 新内容key添加时,get_node(key)获取key被分配的node;及get_host(key)获取key 被分配到的机器
    
    * 节点的引入：保证每台机器负载均衡
    """
    def __init__(self, hosts, replicas = 10):
        self._hosts = {}
        self._ring = []
        self._length = len(hosts)*replicas
        self._build(hosts, replicas)
    
    def _build(self, hosts, replicas):
        for host in hosts:
            for i in xrange(replicas):
                key = "{0}_{1}".format(host,i)
                hsh = self._hash(key)
                
                self._hosts[str(hsh)] = host
                print bisect_right(self._ring, hsh),hsh,host
                self._ring.insert(bisect_right(self._ring, hsh), hsh)
                print self._ring


    def _hash(self,s):
        return hash(md5(s).digest()) % self._length

    
    def get_node(self, key):
        hsh = self._hash(key)
        index = bisect_right(self._ring, hsh)
        if index >= len(self._ring): index = 0

        return self._ring[index]

    def get_host(self, key):
        return self._hosts[str(self.get_node(key))]

    
    
if __name__ == '__main__':
    from random import sample
    from string import letters

    '''
    loop = 100000
    hosts = ["192.168.1.%d" % i for i in xrange(1, 10)]
    ch = ConsistentHash(hosts,replicas=100)
    
    rnd_key = lambda: "".join(sample(letters, 10))
    count = {}

    for i in xrange(loop):
        host = ch.get_host(rnd_key())
        count[host] = count[host] + 1 if host in count else 1

    avg = loop / len(hosts)

    for h in sorted(count.iterkeys()):
        c = count[h]
        print "{0:15} {1:8} {2:8.2f}%".format(h, c, float(c) / avg * 100)

        if c< avg*0.6:
            print "ERROR", h,c
    '''
    
    dh = 'asdfasd'
    hosts = ["192.168.1.%d" % i for i in xrange(1, 5)]
    ch = ConsistentHash(hosts,replicas=10)
    print ch.get_host(dh)

