var Server = require('../core/server');
var Uti = Server.Uti;
var Context = Server.Context;
var events = require("events");


var index = {
    home:function(req, res){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        var db = getdb('mcm','192.168.1.3');
        res.write(JSON.stringify(db));
        res.end();
    },
    about:function(req, res){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write("this's about");
        var redis = getRedis();
        console.log(redis);
        res.end();
    }
}


var handlers = [];
Uti.setRouter(handlers,index.home, '/home');
Uti.setRouter(handlers,index.about, '/about');


exports.module = handlers;
