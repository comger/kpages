Uti = require('./core/utility').Uti;

var index = {
    home:function(req, res){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write("this's home");
        res.end();
    }
}


exports.module = index;
