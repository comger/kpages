# -*- coding:utf-8 -*-

"""
    系统配置文件

    不建议修改本文件，应用设置应该保存在 /settings.py 应用配置文件中。
    应用配置会覆盖同名的系统配置。

"""

# 服务器监听端口
PORT = 8088

# 数据库超时时间
SOCK_TIMEOUT = 10

# SESSION 过期时间(秒)
SESSION_EXPIRE = 60 * 10

#是否使用redis ression
REDIS_SESSION = False

# 是否启动调试模式
DEBUG = True

# 是否启动压缩
GZIP = True

# 指定RequestHandler 所在目录
ACTION_DIR = ("action",)

# 指定任务（srvcmd）所在目录
JOB_DIR = "logic"

# 指定TestCase 所在目录
UTEST_DIR = "utest"

# 静态目录名
STATIC_DIR_NAME = "static"

# 模板目录名
TEMPLATE_DIR_NAME = "template"

# COOKIE 加密
COOKIE_SECRET = "61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o/Vo="

# COOKIE 安全
XSRF_COOKIES = False

# 缓存服务器
CACHE_HOST = "localhost"

# 数据库服务器
DB_HOST = "localhost"

# 数据库名
DB_NAME = "test"

GFS_NAME = 'gfs'

SERVICE_CHANNEL = "channel1"
