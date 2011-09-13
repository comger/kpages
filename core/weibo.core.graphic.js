/**
 jQuery Graphic 图型处理类库
    author      : comger 
    createdate  : 2011-08-10
    History 
        
**/

//图形的基本功能
Weibo.Graphic = Weibo.Graphic || ((function(){
    var Graphic = {
        GetPointsDis:function(point1,point2){ //获取 point1 和 point2 的 距离
            var dx = point1.x - point2.x;
            var dy = point1.y - point2.y;
            return Math.pow((dx * dx +dy * dy), 0.5)
        },
        CrossMul:function(v1,v2){ // 计算向量叉乘
            return v1.x*v2.y-v1.y*v2.x;
        },
        CheckCross:function(p1,p2,p3,p4){ //判断两条线段是否相交
            var v1={x:p1.x-p3.x,y:p1.y-p3.y},
            v2={x:p2.x-p3.x,y:p2.y-p3.y},
            v3={x:p4.x-p3.x,y:p4.y-p3.y},
            v=this.CrossMul(v1,v3)*this.CrossMul(v2,v3);
            v1={x:p3.x-p1.x,y:p3.y-p1.y}
            v2={x:p4.x-p1.x,y:p4.y-p1.y}
            v3={x:p2.x-p1.x,y:p2.y-p1.y}
            return v<=0&&this.CrossMul(v1,v3)*this.CrossMul(v2,v3)<=0;
        },
        InFences:function(curPoint,points){//判断一个点是否在多边图形中,算法需要测试
            var p1,p2,p3,p4
            p1=curPoint;
            p2={x:-100,y:curPoint.y}
            var count=0;
            //对每条边都和射线作对比
            for(var i=0;i<points.length;i++){
                p3=points[i];
                p4= (i+1==points.length)?points[0]:points[i+1];
                if(this.CheckCross(p1,p2,p3,p4)&&p3.y!=p1.y||p4.y==p1.y){
                    count++;
                }
            }
            return count%2!=0;
        }
    }
    window.Ga = Graphic;
    return Graphic;
})());

/**
 图型容器类
 功能清单
    Clear() 清空容器
**/
Weibo.Graphic.Canvas = Weibo.Graphic.Canvas || ((function(){
    var Canvas = function(exp){ this.Init(exp) };
	Canvas.prototype = {
		Options:{
			offset:null
		},
		Graphics:[], //所有图型列表
		OldGraphics:[],
		Ctx:null,
        Offset:null,
        CurGrgph:null, //光标所在的图形
        EndPos:null, // 图型结束点
        Canvas:null,
		Init:function(exp){
            this.Canvas = $(exp);
			this.Ctx = $(exp)[0].getContext('2d');
			var _offset = this.Options.Offset = $(exp).offset();
            var self = this;

            //初始化画笔线条样式
            this.Ctx.prototype = {
                fillStyle:'#000',
                strokeStyle:'blue',
                lineWidth:1
            }

			$(exp).mousemove(function(e){ // 移动事件支持
				var m ={ x:(e.clientX + window.pageXOffset-_offset.left), y:(e.clientY + window.pageYOffset-_offset.top)};
                //var m ={ x:e.clientX,y:e.clientY};                
                //console.log(m);
                if(self.CurGrgph == null){ //如果当前没有匹配图型，开始搜索，如果搜索到，设置当前图型，并执行当前图型的进入事件
                    self.CurGrgph = self.Find(m);
                    if(self.CurGrgph)
                        self.CurGrgph.MouseOver.Call(e);
                }         

                //如果有当前图型，并且光标不在当前图片上，执行离开事件，并清空当前图型
                if(self.CurGrgph && !self.CurGrgph.InRange(m)){
                    self.CurGrgph.MouseOut.Call(e);
                    self.CurGrgph = null;
                }
			});

            $(exp).click(function(e){ //点击事件
                var m ={ x:e.clientX, y:e.clientY};
                if(self.CurGrgph == null){ //如果当前没有匹配图型，开始搜索，如果搜索到，设置当前图型，并执行当前图型的进入事件
                    self.CurGrgph = self.Find(m);
                    if(self.CurGrgph)
                        self.CurGrgph.Click.Call(e);
                } 
            });
		},
		Draw:function(graphic){//画传入的图型
            this.SetStyle(graphic.Opts.styles || {})
			graphic.Render(this.Ctx);
            this.Ctx.save();
            this.OldGraphics = this.Graphics;
            graphic.Index = this.Graphics.length;
			this.Graphics.push(graphic);
		},
        SetStyle:function(styles){//设置线条样式，需要重写优化
            this.Ctx.fillStyle = styles.fillStyle ||  "#000";
            this.Ctx.strokeStyle = styles.strokeStyle || "blue";
            this.Ctx.lineWidth = styles.lineWidth || 1;
        },
		Find:function(m){ // find the graph content the m and it's best font of graphics
            var gs = this.Graphics;
            for(var i=gs.length-1;i>=0;i--){
                if(gs[i].InRange && gs[i].InRange(m)) return gs[i];
            }
            return null;
		},
        Clear:function(){//clear the canvas 
            this.Ctx.clearRect(0, 0, this.Canvas.width(), this.Canvas.height());
        },
        Store:function(graphic){ // 生成返回快照,排除传入的graphic
            
        },
        Restore:function(){//快速画出快照

        },
        GetMouse:function(e){
            
        }

	};
    return Canvas;
})());

//基础图型约束 
Weibo.Graphic.Base = Weibo.Graphic.Base || ((function(){
    var Base =function(){}
    Base.prototype= {
        MouseOver:null,
        MouseOut:null,
        Click:null,
        Starting:null,
        Drawing:null,
        Stop:null,
        InitMouseEvn:function(){
            this.MouseOver = new W.Delegate();
            this.MouseOut = new W.Delegate();
            this.Click = new W.Delegate();
        },
        InitDrawEvn:function(){
            this.Starting = new W.Delegate();
            this.Drawing = new W.Delegate();
            this.Stop = new W.Delegate();
        }
    }
    return Base;
})())


//矩型
Weibo.Graphic.Rect = Weibo.Graphic.Rect || ((function(){
    var Rect = function(opts){ this.Init(opts);}
    Co.Inheritance(Weibo.Graphic.Base,Rect);
    Co.extend({
        Opts:null,
        Init:function(opts){
            this.Opts = opts;
            this.InitMouseEvn();
        },
        InRange:function(m){ //需要支持Mouse、Click 等事件时，此方法必须实现
            var o = this.Opts;
            return o.x<=m.x && m.x<=(o.x+o.w) && o.y <= m.y && m.y<= (o.y+o.h)
        },
        Render:function(ctx){
            //todo
            ctx.fillRect(this.Opts.x,this.Opts.y,this.Opts.w,this.Opts.h);
        }
    },Rect.prototype)
    return Rect;
})())

//线条
Weibo.Graphic.Line = Weibo.Graphic.Line || ((function(){
    var Line = function(opts){ this.Init(opts) }
    Line.prototype = {
        Opts:null,
        Init:function(opts){  this.Opts = opts },
        Render:function(ctx){
            ctx.beginPath();
            ctx.moveTo(this.Opts.x,this.Opts.y);
            ctx.lineTo(this.Opts.endx,this.Opts.endy);
            ctx.closePath();
            ctx.stroke();
        }
    }
    return Line;
})())


//圆型
/**
   opts={
        x:100,圆点x坐标
        y:100, 圆点y坐标
        r:50,半径
        w：0
    }
**/
Weibo.Graphic.Arc = Weibo.Graphic.Arc || ((function(){
    var Arc = function(opts){ this.Init(opts) }
    Co.Inheritance(Weibo.Graphic.Base,Arc);
    Co.extend({
        Opts:null,
        Init:function(opts){  
            this.Opts = opts;
            this.InitMouseEvn();
        },
        InRange:function(m){//需要支持Mouse、Click 等事件时，此方法必须实现
            var dis = Ga.GetPointsDis(m,{x:this.Opts.x,y:this.Opts.y});
            return dis<=this.Opts.r
        },
        Render:function(ctx){
            var o = this.Opts;
            ctx.beginPath();
            ctx.arc(o.x,o.y,o.r,o.w,Math.PI*2,true);
            ctx.closePath();
            ctx.stroke();
        }
    },Arc.prototype);
    return Arc;
})())


/**
    多边型 Fences
    opts = {
        points:[]
        style,
        fill
    }
**/
Weibo.Graphic.Fences = Weibo.Graphic.Fences || ((function(){
    var Fences = function(opts,fill){ this.Init(opts,fill) }
    Co.Inheritance(Weibo.Graphic.Base,Fences);
    Co.extend({
        Opts:null,
        IsFill:true,
        Init:function(opts,fill){  
            this.Opts = opts;
            this.IsFill = fill;
            this.InitMouseEvn();
        },
        InRange:function(m){//需要支持Mouse、Click 等事件时，此方法必须实现
            return Ga.InFences(m,this.Opts.points);
        },
        Render:function(ctx){
            var o = this.Opts;
            ctx.beginPath();
            
            var beginPoint = o.points[0];
            ctx.moveTo(beginPoint.x,beginPoint.y); //第一个点作为起始点
            for(var i=1;i<o.points.length;i++){ // 画图
                var _tempPoint = o.points[i];
                ctx.lineTo(_tempPoint.x,_tempPoint.y);
            }          
            //ctx.lineTo(beginPoint.x,beginPoint.y);
            if(this.IsFill){ //填充还是勾边
                ctx.fill();
            }else{
                ctx.closePath();
                ctx.stroke();
            }
        }
    },Fences.prototype);
    return Fences;
})())


