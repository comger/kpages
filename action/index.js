Uti = require('../core/server').Uti;

var index = {
    home:function(req, res){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write("this's home");
        res.end();
    },
    about:function(req, res){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write("this's about");
        res.end();
    }
}


var handlers = [];
Uti.setRouter(handlers,index.home, '/home');
Uti.setRouter(handlers,index.about, '/about');


exports.module = handlers;
