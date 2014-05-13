#!/usr/bin/env python
#-*- coding:utf-8 -*-

"""
    系统队列处理服务

    通常和 Redis 部署在同一台服务器上，也可以通过命令行参数指定(--help 查看所有命令行参数)。

    历史:
        2011-08-27  + 增加 optparse 处理命令行参数。
"""

from pprint import pprint
from optparse import OptionParser, OptionGroup
from kpages import Service, reflesh_config


def _show_info(**kwargs):

    services = kwargs.pop("services")
    settings = kwargs

    print "MQ Service, version 0.9.2011.08"
    print

    print "Parameters:"
    for k in sorted(settings.keys()):
        if k.startswith("__"):
            continue
        print "  {0:<20} : {1}".format(k.upper(), settings[k])

    print

    print "Services:"
    pprint(services)

    print


def _get_opt():
    parser = OptionParser("%prog [options]", version="%prog v0.9")
    parser.add_option("--config", dest="config",
                      default='setting.py', help="config for app")
    parser.add_option("--host", dest="host",
                      default=None, help="Redis server address.")
    parser.add_option("--channel", dest="channel",
                      default=None, help="Subscribe channel name.")
    parser.add_option("--debug", dest="debug",
                      action="store_true", default=None, help="Debug mode.")
    parser.add_option("--ndebug", dest="debug",
                      action="store_false", help="No Debug mode.")

    return parser.parse_args()


def main():
    opts, args = _get_opt()
    reflesh_config(opts.config)
    if opts.debug is not None:
        __conf__.DEBUG = opts.debug
    
    Service(host=__conf__.CACHE_HOST or opts.host, channel=__conf__.SERVICE_CHANNEL or opts.channel,
            callback=_show_info).run()


if __name__ == "__main__":
    main()

# vim: ts=4 sw=4 sts=4 expandtab
