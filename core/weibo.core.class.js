/**
    面向对象 解释工具
    author      : comger 
    createdate  : 2011-08-10
    History  
**/

/**
  面向对象的解释器
  demo 
    var CustomUser = new Class({
        fn1:function(){..},
        Opt:{}
    });

    var cuser = new CustomUser();
    
**/
Weibo.Class = Weibo.Class ||((function(){
    var _Class = function(opts){
        
    }
    _Class.prototype = {
        
    }
    window.Class = _Class;
    return _Class;
})())

function Timeout(fun, time){
    var flag = false;
    return { set : function(){ 
        if(!flag){
            flag = setTimeout(function(){
                fun();
                flag = false;
            }, time);
        }}, clear : function(){
            if(flag){
                clearTimeout(flag);
                flag = false;
            }
    }}
}
