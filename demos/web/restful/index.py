# -*- coding:utf-8 -*- 
"""
    index action
    author comger@gmail.com
"""
from kpages import url,ContextHandler,LogicContext,get_context

@url(r"/")
class IndexHandler(ContextHandler):
    def get(self):
        with LogicContext(db_host='localhost'):
            account = get_context().get_mongo()['account']
            print account


        self.write('hi kpages')
