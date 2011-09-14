/**
    web 3d graphic
    author      : comger 
    createdate  : 2011-09-13
    提供立方体，柱体
**/


/**
    立方体 Cube
    opts = {
        x,
        y,
        w,
        h,
        v, //立方向量
        color,
        styles:{
        }
    }
**/
Weibo.Graphic.Cube = Weibo.Graphic.Cube || ((function(){
    var Cube = function(opts){ this.Init(opts);}
    Co.Inheritance(Weibo.Graphic.Base,Cube);
    Co.extend({
        Opts:null,
        Init:function(opts){
            this.Opts = opts;
            this.InitMouseEvn();
        },
        InRange:function(m){ //需要支持Mouse、Click 等事件时，此方法必须实现
            return Ga.InFences(m,this.Points);
        },
        Render:function(ctx){
            var o = this.Opts;
            var startcolor = o.color;
            endcolor= startcolor.replace("#","0x");
            endcolor = "#"+(parseInt(endcolor)+o.v.x).Pad(6);
            //endcolor = endcolor.toString(16).replace("0x","#");
            
            var grd=ctx.createLinearGradient(o.x,o.y,o.x+o.w,o.y+o.h);
            grd.addColorStop(0,startcolor);
            grd.addColorStop(1,endcolor);
            ctx.fillStyle=grd;
            ctx.fillRect(o.x,o.y,o.w,o.h);
 
            //上面
            var top1 = {x:o.x + o.v.x,y:o.y - o.v.y}
            var top2 = {x:top1.x+o.w,y:top1.y}
            
            var ps = [{x:o.x,y:o.y},{x:top1.x,y:top1.y},{x:top2.x,y:top2.y},{x:o.x+o.w,y:o.y}]
            var _tri = new Weibo.Graphic.Fences({points:ps},true);
            grd=ctx.createLinearGradient(o.x,o.y,top1.x,top1.y);
            grd.addColorStop(0,endcolor);
            grd.addColorStop(1,startcolor);
            ctx.fillStyle=grd;
            _tri.Render(ctx)

            var ps2 = [{x:o.x+o.w,y:o.y},{x:top2.x,y:top2.y},{x:top2.x,y:top2.y+o.h},{x:o.x+o.w,y:o.y+o.h}]
            var _tri2 = new Weibo.Graphic.Fences({points:ps2},true);
            ctx.fillStyle=grd;
            _tri2.Render(ctx)

            this.Points = [{x:o.x,y:o.y},{x:top1.x,y:top1.y},{x:top2.x,y:top2.y},{x:top2.x,y:top2.y+o.h},{x:o.x+o.w,y:o.y+o.h},{x:o.x,y:o.y+o.h}];
            
        }
    },Cube.prototype)
    return Cube;
})())

/**
    Cylinder 圆柱体
     opts = {
        x,
        y,
        r,
        h,
        color,
        styles:{
        }
    }
**/
Weibo.Graphic.Cylinder = Weibo.Graphic.Cylinder || ((function(){
    var Cylinder = function(opts){ this.Init(opts);}
    Co.Inheritance(Weibo.Graphic.Base,Cylinder);
    Co.extend({
        Opts:null,
        Init:function(opts){
            this.Opts = opts;
            this.InitMouseEvn();
        },
        InRange:function(m){ //需要支持Mouse、Click 等事件时，此方法必须实现
            var o = this.Opts;
            var rh = o.r*o.rate;
            var flag = 0;
            var v = {x:m.x+o.x,y:o.y+m.y}
            if((v.x*v.x/o.r+v.y*v.y/rh)<1)
                flag ++;//是否在上面的椭圆中

            var points = [Ga.NewPoint(o.x-o.r,o.y),Ga.NewPoint(o.x+o.r,o.y),Ga.NewPoint(o.x+o.r,o.y+o.h),Ga.NewPoint(o.x-o.r,o.y+o.h)]
            if(Ga.InFences(m,points))
                flag++ //是否在中间的矩形中

            v = {x:m.x+o.x,y:o.y+o.h+m.y}
            if((v.x*v.x/o.r+v.y*v.y/rh)<1)
                flag ++;//是否在下面的椭圆中

            return flag>0
        },
        Render:function(ctx){
            var o = this.Opts;
            var startcolor = o.color;
            endcolor= startcolor.replace("#","0x");
            endcolor = "#"+(parseInt(endcolor)+o.h).Pad(6);
            //endcolor = endcolor.toString(16).replace("0x","#");
            
            var grd=ctx.createLinearGradient(o.x,o.y,o.x+o.r,o.y+o.h);
            grd.addColorStop(0,startcolor);
            grd.addColorStop(1,endcolor);

            ctx.save();
            ctx.scale(1,o.rate);
            ctx.beginPath();
            ctx.fillStyle=grd;

            ctx.fillRect(o.x-o.r,o.y,o.r*2,o.h); //画矩型
            ctx.arc(o.x,o.y+o.h, o.r, 0, Math.PI*2, false); //画下面的椭圆
            ctx.arc(o.x,o.y, o.r, 0, Math.PI*2, false);//画上面的椭圆
            ctx.closePath();
            ctx.fill();
            

            ctx.beginPath();
            ctx.strokeStyle ="#cccccc";
            ctx.arc(o.x,o.y, o.r, 0, Math.PI*2, false);
            ctx.closePath();
            ctx.stroke();
            ctx.restore(); //还原变的比率
            this.Points = [];
        }
    },Cylinder.prototype)
    return Cylinder;
})())
