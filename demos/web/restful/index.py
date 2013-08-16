# -*- coding:utf-8 -*- 
"""
    index action
    author comger@gmail.com
"""
from kpages import url,ContextHandler,LogicContext,get_context

@url(r"/")
class IndexHandler(ContextHandler):
    def get(self):
        print self.session('demokey',dict(abcdeed='deee',dd='dssd'))

        print self.session('demokey')
        self.write('hi kpages')
