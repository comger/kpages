#!/usr/bin/env python
# -*- coding:utf-8 -*-
"""
    MinxiHandler for kpages
    author comger@gmail.com
    1. auth
    
"""
import json
import tornado
from utility import mongo_conv 
try:
    import urlparse
except ImportError:
    import urllib.parse as urlparse

AUTH_KEY = 'authed_user'

class AuthMinix(object):
    uid = property(lambda self:self.current_user['_id'])

    def get_current_user(self):
        user_json = self.get_secure_cookie(AUTH_KEY)
        if not user_json: return None
        return json.loads(user_json)
        
    def prepare(self):
        if not self.current_user:
            url = __conf__.login_url
            if "?" not in url:
                if urlparse.urlsplit(url).scheme:
                    next_url = self.request.full_url()
                else:
                    next_url = self.request.uri

                url += "?" + urlencode(dict(next=next_url))
            self.redirect(url)
            return

    def login(self, user):
        user = mongo_conv(user)
        self.set_secure_cookie(AUTH_KEY, json.dumps(user))


