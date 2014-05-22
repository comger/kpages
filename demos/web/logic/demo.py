# -*- coding:utf-8 -*-
from kpages import srvcmd,get_context

@srvcmd('demofun')
def demofun(data):
    print '1', data



@srvcmd('demofun')
def demofun1(data):
    print '2',data


