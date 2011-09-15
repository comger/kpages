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
            var c = new Weibo.Color(startcolor);
            c.changeS(0.2);
            c.changeV(-50);

            var endcolor = c.toString();
            var grd=ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
            grd.addColorStop(0,startcolor);
            grd.addColorStop(1,endcolor);
            ctx.fillStyle=grd;
            ctx.fillRect(o.x,o.y,o.w,o.h);
 
            //上面
            var top1 = {x:o.x + o.v.x,y:o.y - o.v.y}
            var top2 = {x:top1.x + o.w,y:top1.y}
            
            var ps = [{x:o.x,y:o.y},{x:top1.x,y:top1.y},{x:top2.x,y:top2.y},{x:o.x+o.w,y:o.y}]
            var _tri = new Weibo.Graphic.Fences({points:ps},true);
            grd=ctx.createLinearGradient(o.x,o.y,top2.x,top2.y);
            grd.addColorStop(0,endcolor);
            grd.addColorStop(1,startcolor);
            ctx.fillStyle=grd;
            _tri.Render(ctx)

            c.changeS(0.2);
            c.changeV(-50);
            var endcolor2 = c.toString();
            var ps2 = [{x:o.x+o.w,y:o.y},{x:top2.x,y:top2.y},{x:top2.x,y:top2.y+o.h},{x:o.x+o.w,y:o.y+o.h}]
            var _tri2 = new Weibo.Graphic.Fences({points:ps2},true);
            grd=ctx.createLinearGradient(o.x + o.w,o.y,o.x + o.w ,o.y + o.h);
            grd.addColorStop(0,endcolor);
            grd.addColorStop(1,endcolor2);
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

            var v = {x:m.x-o.x,y:m.y-o.y}
            if((v.x*v.x/(o.r*o.r)+v.y*v.y/(rh*rh))<1)
                return true;

            var points = [Ga.NewPoint(o.x-o.r,o.y),Ga.NewPoint(o.x+o.r,o.y),Ga.NewPoint(o.x+o.r,o.y+o.h),Ga.NewPoint(o.x-o.r,o.y+o.h)];
            if(Ga.InFences(m,points))
                return true;

            v = {x:m.x-o.x,y:m.y-o.y-o.h}
            if((v.x*v.x/(o.r*o.r)+v.y*v.y/(rh*rh))<1)
                return true

            return false;
        },
        Render:function(ctx){
            var o = this.Opts;
            var startcolor = o.color;

            var c = new Weibo.Color(startcolor);
            c.changeS(0.2);
            c.changeV(-100);

            var endcolor = c.toString();
            c.changeS(0.2);
            c.changeV(-50);
            var endcolor2 = c.toString();
            
            var grd=ctx.createLinearGradient(o.x-o.r,o.y,o.x+o.r,o.y);
            grd.addColorStop(0,startcolor);
            grd.addColorStop(1,endcolor);

            ctx.save();
            ctx.scale(1,o.rate); //开始变形

            ctx.beginPath();
            ctx.fillStyle=grd;
            ctx.fillRect(o.x-o.r,o.y/o.rate,o.r*2,o.h/o.rate); //画矩型，但要还原y轴与高度           
            ctx.arc(o.x,o.y/o.rate+o.h/o.rate, o.r, 0, Math.PI*2, false); //画下面的椭圆 但要还原y轴与高度 
            ctx.closePath();
            ctx.fill();

            //开始上面的椭圆的渐变色区域
            ctx.beginPath();
            grd=ctx.createLinearGradient(o.x-o.r,o.y/o.rate,o.x+o.r,o.y/o.rate);
            grd.addColorStop(0,endcolor);
            grd.addColorStop(1,startcolor);
            ctx.fillStyle=grd;
            ctx.arc(o.x,o.y/o.rate, o.r, 0, Math.PI*2, false);//画上面的椭圆，但要还原y轴
            ctx.closePath();
            ctx.fill();

            ctx.restore(); //还原变的比率
        }
    },Cylinder.prototype)
    return Cylinder;
})())

/**
    Sector 
    opts = {
        x,
        y,
        r,
        h,
        rate,
        offset,
        color
    }
**/
Weibo.Graphic.Sector = Weibo.Graphic.Sector || ((function(){
    var Sector = function(opts){ this.Init(opts);}
    Co.Inheritance(Weibo.Graphic.Base,Sector);
    Co.extend({
        Opts:null,
        Init:function(opts){
            this.Opts = opts;
            this.InitMouseEvn();
        },
        InRange:function(m){ //需要支持Mouse、Click 等事件时，此方法必须实现
            var o = this.Opts;
            return false;
        },
        Render:function(ctx){
            var o = this.Opts;
            var startcolor = o.color;
            
            var c = new Weibo.Color(startcolor);
            c.changeS(0.2);
            c.changeV(-100);
            var endcolor = c.toString();

            a = Ga.NewPoint(o.x+o.r * Math.cos((o.rate+o.offset)*Math.PI/2),o.y+o.r * Math.sin((o.rate+o.offset)*Math.PI/2));
            b = Ga.NewPoint(o.x+o.r * Math.cos(o.offset*Math.PI/2),o.y+o.r * Math.sin(o.offset*Math.PI/2));

            grd=ctx.createLinearGradient(o.x,o.y,b.x,b.y);
            grd.addColorStop(0,endcolor);
            grd.addColorStop(1,startcolor);
            ctx.fillStyle=grd;
            
            //侧面
            ctx.beginPath();
            ctx.moveTo(o.x,o.y);
            ctx.lineTo(o.x,o.y+o.h);
            ctx.lineTo(a.x,a.y+o.h);
            ctx.lineTo(a.x,a.y);
            ctx.closePath();
            ctx.fill();
            
            //正面
            grd=ctx.createLinearGradient(o.x,o.y,b.x,b.y);
            grd.addColorStop(0,endcolor);
            grd.addColorStop(1,startcolor);
            ctx.fillStyle=grd;
            
            ctx.beginPath();
            ctx.moveTo(a.x,a.y);
            ctx.lineTo(a.x,a.y+o.h);
            dpoint = Ga.NewPoint(o.x+(o.r+o.h*o.rate) * Math.cos((o.rate/2 +o.offset)*Math.PI/2),o.y+(o.r+o.h*o.rate)* Math.sin((o.rate/2 +o.offset)*Math.PI/2));
            ctx.quadraticCurveTo(dpoint.x,dpoint.y+o.h,b.x,b.y+o.h);
            ctx.lineTo(b.x,b.y);
            ctx.closePath();
            ctx.fill();
            
            //上面
            c.changeS(0.2);
            c.changeV(-100);
            var endcolor2 = c.toString();
            grd=ctx.createLinearGradient(o.x,o.y,b.x,b.y);
            grd.addColorStop(0,startcolor);
            grd.addColorStop(1,endcolor2);
            ctx.fillStyle=grd;
            
            ctx.beginPath();
            ctx.moveTo(o.x,o.y);
            ctx.lineTo(a.x,a.y);
            dpoint = Ga.NewPoint(o.x+(o.r+o.h*o.rate) * Math.cos((o.rate/2 +o.offset)*Math.PI/2),o.y+(o.r+o.h*o.rate)* Math.sin((o.rate/2 +o.offset)*Math.PI/2));
            ctx.quadraticCurveTo(dpoint.x,dpoint.y,b.x,b.y);
            ctx.lineTo(o.x,o.y);
            ctx.closePath();
            ctx.fill();
            

            


        }
    },Sector.prototype)
    return Sector;
})())

