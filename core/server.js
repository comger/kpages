/**
    author comger@gmail.com
    mvc app server
**/

var http = require('http');
var url = require('url');

__conf__ = require('../setting').setting;
var fs = require('fs');

var Uti = {
    root_path:process.argv[1].substr(0,process.argv[1].lastIndexOf("/")+1),
    getModule:function(dir){ //获取dir 下js模块，并返回列表
        var res = [] , files = fs.readdirSync(dir);
        files.forEach(function(file){
            var pathname = dir+'/'+file
             , stat = fs.lstatSync(pathname);
            if (!stat.isDirectory() && file.indexOf("~")<0){
               res.push(pathname.replace(Uti.root_path,'./').replace('.js',''));
            }
       });
       return res
    },
    setRouter:function(hs,fn, r){ //为方式添加router
        var ky = {'key':r,'fn':fn};
        hs.push(ky);
    },
    isInRouter:function(url,r){ //是否满足router 正则
        var re=new RegExp(r);
        return re.test(url);
    },
    url404:function(req,res){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write("404,can not find this page");
        res.end();
    },
    urlError:function(req,res,e){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write("error:"+e);
        console.log('error:'+e)
        res.end();
    }
}


function start(){
    console.log("run server at port:"+ __conf__.PORT);
    console.log("run server at path:"+ Uti.root_path);

    var modules = [];
    __conf__.ACTION_DIR.forEach(function(dir){
        modules =  modules.concat(Uti.getModule(Uti.root_path+dir));
    });

    var handlers = [];
    modules.forEach(function(m){
        handlers = handlers.concat(require("."+m).module);
    })
    console.log(handlers);
    
    http.createServer(function (req, res) {
       res.writeHead(200, {'Content-Type': 'text/plain'});
       console.log(req.url);
       var pathname = url.parse(req.url).pathname;
       handlers.forEach(function(h){
            if(Uti.isInRouter(pathname,h.key)){
                    try{
                        return h.fn(req,res);
                    }catch(e){
                        if(__conf__.DEBUG){
                            Uti.urlError(req,res,e);
                        }else{
                            //TODO
                        }
                    }
                    
            }
       })
       
       Uti.url404(req,res);
          
    }).listen(__conf__.PORT);
}

exports.start = start;
exports.Uti = Uti;
