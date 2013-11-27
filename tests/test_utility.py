#-*- coding:utf-8 -*-
import unittest
from kpages.utility import mongo_conv

class TestUtility(unittest.TestCase):
    def test_mongo_conv(self):
        data = {("test",):"this is a test"}
        mongo_conv(data)



if __name__ == "__main__":
    unittest.main()
