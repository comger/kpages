/**
 author comger@gmail.com
 js 帮助方法
**/
var fs = require('fs');

var Uti = {
    root_path:process.argv[1].substr(0,process.argv[1].lastIndexOf("/")+1),
    getModule:function(dir){ //获取dir 下js模块，并返回列表
        var res = [] , files = fs.readdirSync(dir);
        files.forEach(function(file){
            var pathname = dir+'/'+file
             , stat = fs.lstatSync(pathname);
            if (!stat.isDirectory()){
               res.push(pathname.replace(Uti.root_path,'./').replace('.js',''));
            }
       });
       return res
    },
    setRouter:function(fn, r){ //为方式添加router
        fn.prototype._router = r;
        fn.prototype._type = "handler";
    },
    isInRouter:function(url,r){ //是否满足router 正则
        var re=new RegExp(r);
        return re.test(url);
    }
}

exports.Uti = Uti;


