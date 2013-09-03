# -*- coding:utf-8 -*-
"""
    author comger@gmail.com
"""
import json
from pyquery import PyQuery as pyq
from kpages import LogicContext, reflesh_config
from logic.city import add
from logic.utility import m_page
from unittest import TestCase


class CityCate(object):
    _url = 'http://d.360buy.com/area/get?fid={0}'

    def test_add(self):
        ps = self.get_citys()
        for p in ps:
            if p['id'] < 100:
                print p['name'], p['id']
                r, v = add(p['name'])
                cs = self.get_citys(p['id'])
                for c in cs:
                    print '**', c['name']
                    rr, vv = add(c['name'], v['_id'], 1)
                    xs = self.get_citys(c['id'])
                    for x in xs:
                        print '****', x['name']
                        rrr, vvv = add(x['name'], vv['_id'], 2)

    def get_citys(self, fid=0):
        url = self._url.format(fid)
        doc = pyq(url=url)
        text = doc.text()[21:-1]
        try:
            return json.loads(text)
        except:
            print text
            return []


class DemoCase(TestCase):
    def setUp(self):
        pass

    def testprint(self):
        print m_page('city')


if __name__ == '__main__':
    case = CityCate()
    reflesh_config('setting.py')
    with LogicContext():
        case.test_add()
