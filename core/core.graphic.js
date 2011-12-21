/**
    Kpages core Canvas　图形相关扩展库
    author      : comger 
    createdate  : 2011-12-13
    History 
**/

Kpages.Graphic = {
    version:"dev.0.1"    
}
window.Ga = Kpages.Graphic;

//图形相关辅助方法
Ga.Utility = {
    getPointsDis:function(point1,point2){ //获取 point1 和 point2 的 距离
        var dx = point1.x - point2.x;
        var dy = point1.y - point2.y;
        return Math.pow((dx * dx +dy * dy), 0.5)
    },
    crossMul:function(v1,v2){ // 计算向量叉乘
        return v1.x*v2.y-v1.y*v2.x;
    },
    checkCross:function(p1,p2,p3,p4){ //判断两条线段是否相交
        var v1={x:p1.x-p3.x,y:p1.y-p3.y},
        v2={x:p2.x-p3.x,y:p2.y-p3.y},
        v3={x:p4.x-p3.x,y:p4.y-p3.y},
        v=this.CrossMul(v1,v3)*this.CrossMul(v2,v3);
        v1={x:p3.x-p1.x,y:p3.y-p1.y}
        v2={x:p4.x-p1.x,y:p4.y-p1.y}
        v3={x:p2.x-p1.x,y:p2.y-p1.y}
        return v<=0&&this.CrossMul(v1,v3)*this.CrossMul(v2,v3)<=0;
    },
    inFences:function(curPoint,points){//判断一个点是否在多边图形中,算法需要测试
        var p1,p2,p3,p4
        p1=curPoint;
        p2={x:-100,y:curPoint.y}
        var count=0;
        //对每条边都和射线作对比
        for(var i=0;i<points.length;i++){
            p3=points[i];
            p4= (i+1==points.length)?points[0]:points[i+1];
            if(p4.y == curPoint.y)
                continue;
            if(p1.y < Math.min(p3.y, p4.y))
                continue;
            if(p1.y > Math.max(p3.y,p4.y))
                continue;
            if(p3.y == curPoint.y && p1.x>p3.x){
                next= (i+1==points.length)?points[0]:points[i+1];
                last= (i == 0)?points[points.length - 1]:points[i-1];
                if((next.y - curPoint.y)*(last.y - curPoint.y)<0)
                    count++;
                continue;
            }
            if(this.CheckCross(p1,p2,p3,p4))
                count++;
        }
        return count%2!=0;
    },
    newPoint:function(x,y){ //快速创建一个坐标点
        return {x:x,y:y}
    }
}

//虚类，提供鼠标事件、鼠标事件委托及效果；需要与可视的图形配合使用
Ga.MouseArea = Class({
    enabled:false,
    hoverEnabled:false,
    dragActive:false,
    dragTarget:null,
    dragMaximumX:0,
    dragMaximumY:0,
    dragMinimumX:0,
    dragMinimumY:0,
    acceptedButtons:function(btn){},
    containsMouse:function(point)(),
    onCanceled:function(e),
    onClicked:function(e),
    onDoubleClicked:function(e),
    onEntered:function(e),
    onExited:function(e),
    onPositionChanged:function(e),
    onPressAndHold:function(e),
    onPressed:function(e),
    onReleased:function(e)
})

//Graphic 图形基础类型
Ga.Item = Class({
    opts:{
        x:0,
        y:0,
        z:0,
        width:0,
        height:0,
        opacity:0,
        scale:0,
        state:"ready",
        visible:false,
        parent:null
    },
    mouseArea:null
})


/**
    图库
**/
Ga.Rect = Class(Ga.Item,{
    opts:{
        borderColor:"#cccccc",
        borderWidth:1,
        color:"#cccccc",
        gradient:null,
        radius:0,
        smooth:true
    },
    init:function(opts){ 
        this.opts.extend(opts);
    },
    render:function(){
        console.log(this.opts);
    }
})

