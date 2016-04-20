# -*- coding:utf-8 -*-
"""
    auto test tools
    author comger@gmail.com
    function:
        python app.py --test all     : test all case for app
        python app.py --test line    : test the methods in line path
        python app.py --pro  line    : profile the methods in line path(demo like --test)
    demos:
        python app.py --test test_city.DemoCase.testprint :test testprint method
        python app.py --test test_city.DemoCase           :test methods in DemoCase class
        python app.py --test test_city                    :test methods in test_city.py
        python app.py --test all                          :test methods in app's __conf__.UTEST_DIR

    utest dir is config in __conf__.UTEST_DIR
"""
import os
import profile
from inspect import isclass, ismethod, getmembers
from unittest import TestCase, TextTestRunner, TestSuite
from utility import _get_members

def load_testcase(module=None):
    _filter = lambda m: isclass(m) and issubclass(m, TestCase) and not m==TestCase
    testcases = _get_members(
        __conf__.UTEST_DIR, member_filter=_filter, in_module=module)
    
    return testcases

def load_testsuites(module=None):
    """ load all test cases in module, if module==None,all test cases in utest dir """
    testcases = load_testcase(module)
    _suites = {}
    for name, cls in testcases.items():
        for n, m in getmembers(cls):
            if n.startswith("test") and ismethod(m):
                _suites["{0}.{1}".format(name, n)] = TestSuite((cls(n),))

    return _suites


def load_testsuites_bypath(line=None):
    _suites = []
    if not line:
        _suites = load_testsuites().values()
    else:
        ls = line.strip().split('.')
        suites = load_testsuites(ls[0])
        if len(ls) == 2:
            for key in suites.keys():
                if key.startswith('utest.{0}.{1}'.format(ls[0], ls[1])):
                    _suites.append(suites[key])
        elif len(ls) == 3:
            _suites = suites.get('utest.' + line)
        elif len(ls) == 1:
            _suites = suites.values()
    
    return _suites
   

def run_test(line=None):
    _suites = load_testsuites_bypath(line)

    print "Unittest:"
    print _suites
    TextTestRunner().run(TestSuite(_suites))


def pro_test(m):
    def _run():
        run_test(m)
    profile.runctx("_run()", globals(), locals())


__al__ = ['run_test', 'pro_test']
