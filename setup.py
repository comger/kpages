#!/usr/bin/env python
#
# Copyright 2009 comger@gmail.com
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

import distutils.core
import sys
# Importing setuptools adds some features like "setup.py develop", but
# it's optional so swallow the error if it's not there.
try:
    import setuptools
except ImportError:
    pass

kwargs = {}


version = "2.0.0"

class PyTest(distutils.core.Command):
    user_options = []
    def initialize_options(self):
        pass
    def finalize_options(self):
        pass
    def run(self):
        import os, sys, unittest
        setup_file = sys.modules['__main__'].__file__
        setup_dir = os.path.abspath(os.path.dirname(setup_file))
        test_loader = unittest.defaultTestLoader
        test_runner = unittest.TextTestRunner()
        test_suite = test_loader.discover(setup_dir)
        test_runner.run(test_suite)


distutils.core.setup(
    name="kpages",
    version=version,
    packages=["kpages"],
    package_data={'': ['*.*']},
    author="comger@gmail.com",
    author_email="comger@gmail.com",
    url="http://github.com/comger/kpages",
    license="http://www.apache.org/licenses/LICENSE-2.0",
    description="kpages is api-centric web application framework for the Tornado and Mongodb",
    scripts=['kpages/kpages_init.py', 'kpages/kpages_web.py', 'kpages/kpages_service.py', 'kpages/kpages_tool.py', 'kpages/kpages_rpc.py'],
    classifiers=[
        'License :: OSI Approved :: Apache Software License',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.6',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: Implementation :: CPython',
        'Programming Language :: Python :: Implementation :: PyPy',
    ],
    keywords=["pymongo", "gridfs", "profile", "tornado", "redis", "session", "router", "MQ"],
    cmdclass={'test': PyTest},
    **kwargs
)
