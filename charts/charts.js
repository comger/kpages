/**
 web charts by html5 canvas and Kpages.Graphic.js
 author comger
**/

//图表工具类
Kpages.Charts = Kpages.Charts || ((function(){
    var Charts = {
        
    }
    
    window.Charts = Charts;
    return  Charts;
})())

//图表基类，约束类
Kpages.Charts.Base = Kpages.Charts.Base || ((function(){
    var Base = function(){ }
    Base.prototype = {
        Width:0,
        Height:0,
        Childs:[],
        InRange:function(m){
        
        },
        Draw:function(ctx){
        
        }
    };
    return Base;
})()) 

/**
 曲线
 opts = {
    x,y,
    caption,
    datasource,
    showname,
    showvalue,
    animation,
    styles:{
    
    }
 }
**/
Kpages.Charts.Curve = Kpages.Charts.Curve || ((function(){
    var Curve = function(opts){ this.Init(opts) }
    Curve.prototype = {
        
    }
    return Curve;
})())
