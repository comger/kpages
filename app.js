var http = require('http');
var url = require('url');


__conf__ = require('./setting').setting;
Uti = require('./core/utility').Uti;

console.log("run server at port:"+ __conf__.PORT);
console.log("run server at path:"+ Uti.root_path);

var modules = [];
__conf__.ACTION_DIR.forEach(function(dir){
    modules =  modules.concat(Uti.getModule(Uti.root_path+dir));
});


http.createServer(function (req, res) {
   res.writeHead(200, {'Content-Type': 'text/plain'});
   var pathname = url.parse(req.url).pathname;
   console.log("Request for " + pathname + " received.");
   res.write(req.url);
   res.end();
   
}).listen(__conf__.PORT);
