# -*- coding -*-
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
        self._hoss = {}
        self._ring = []
    
    def _build(self, hosts, replicas):
        for host in hosts:
            for i in xrange(relicas):
                key = "{0}_{1}".format(host,i)
                hsh = self._hash(key)
                
                self._hosts[str(hsh)] = host
                self._ring.insert(bisect_right(self._ring, hsh), hsh)


    def _hash(self,s):
        return hash(md5(s).digest()) % 10000

    
    def get_node(self, key):
        hsh = self._hash(key)
        index = bisect_right(self._ring, hsh)
        if index >= len(self._ring): index = 0

        return self._ring[index]

    def get_host(self, key):
        return self._hosts(str(self.get_node(key)))

    
    
