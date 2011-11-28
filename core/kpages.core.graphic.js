/**
 jQuery Graphic 图型处理类库
    author      : comger 
    createdate  : 2011-08-10
    History 
**/

//图形的基本功能
Kpages.Graphic = Kpages.Graphic || ((function(){
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
        InArc:function(m,lines){ //判断一个点是否在多个圆弧内,算法需要测试
            
        },
        NewPoint:function(x,y){ //快速创建一个坐标点
            return {x:x,y:y}
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
Kpages.Graphic.Canvas = Kpages.Graphic.Canvas || ((function(){
    var Canvas = function(exp){ this.Init(exp) };
	Canvas.prototype = {
		Options:{
			offset:null
		},
		Graphics:[], //所有图型列表
		OldGraphics:[],
		Ctx:null,
        Offset:null,
        CurGraphic:null, //光标所在的图形
        EndPos:null, // 图型结束点
        Canvas:null,
		Init:function(exp){
            this.Canvas = $(exp);
			this.Ctx = $(exp)[0].getContext('2d');
			var _offset = this.Options.Offset = $(exp).offset();
            var self = this;

			$(exp).mousemove(function(e){ // 移动事件支持
				var m = self.GetMPoint(e);
                if(self.CurGraphic == null){ 
                //如果当前没有匹配图型，开始搜索，如果搜索到，设置当前图型，并执行当前图型的进入事件
                    self.CurGraphic = self.Find(m);
                    if(self.CurGraphic){
                        self.CurGraphic.over.Call(e);
                    }
                }         

                //如果有当前图型，并且光标不在当前图片上，执行离开事件，并清空当前图型
                if(self.CurGraphic && !self.CurGraphic.InRange(m)){
                    self.CurGraphic.out.Call(e);
                    self.CurGraphic = null;
                }
			});
			
			$(exp).mousedown(function(e){
                var m =self.GetMPoint(e);
                if(self.CurGraphic){
                       self.CurGraphic.down.Call(e);
                }
			});
			
			
			$(exp).mouseup(function(e){
                var m =self.GetMPoint(e);
                if(self.CurGraphic){
                       self.CurGraphic.up.Call(e);
                }
			});

            $(exp).click(function(e){ //点击事件
                var m =self.GetMPoint(e);
                if(self.CurGraphic){
                       self.CurGraphic._click.Call(e);
                 }
            });
            
		},
		Draw:function(graphic,index){//画传入的图型
            this.SetStyle(graphic.Opts.styles || {})
            if(graphic.Render)
				graphic.Render(this.Ctx);
            this.Ctx.save();
            this.OldGraphics = this.Graphics;
            if(index){
            	graphic.Index = index;
            	this.Graphics.splice(index, 0, graphic);
            }else{
		        graphic.Index = this.Graphics.length;
				this.Graphics.push(graphic);
            }
            
            //绑定在Canvas对象上
            graphic.ctx = this;

		},
		AutoDraw:function(){//重绘
			this.Clear();
			Co.Map((function(item){
				item.Render(this.Ctx);
			}).Bind(this),this.Graphics);
		},
		Remove:function(graphic){ //移除对象
			this.Graphics.splice(graphic.Index, 1);	
		},
        SetStyle:function(styles){//设置线条样式，需要重写优化
            this.Ctx.fillStyle = styles.fillStyle ||  this.Ctx.fillStyle;
            this.Ctx.strokeStyle = styles.strokeStyle || this.Ctx.strokeStyle;
            this.Ctx.lineWidth = styles.lineWidth || this.Ctx.lineWidth;
        },
		Find:function(m){ // find the graph content the m and it's best font of graphics
            var gs = this.Graphics;
            for(var i=gs.length-1;i>=0;i--){
                if(gs[i].InRange && gs[i].InRange(m)) return gs[i];
            }
            return null;
		},
        Clear:function(){//clear the canvas 
        	this.Ctx.setTransform(1, 0, 0, 1, 0, 0);//?? 关键
            this.Ctx.clearRect(0, 0, this.Canvas.width(), this.Canvas.height());
        },
        Store:function(graphic){ // 生成返回快照,排除传入的graphic
            
        },
        Restore:function(){//快速画出快照

        },
        GetMPoint:function(e){ //获取当前Mouse 坐标
        	var _offset = this.Canvas.offset();
        	return { x:(e.clientX + window.pageXOffset-_offset.left), y:(e.clientY + window.pageYOffset-_offset.top)};
        }

	};
    return Canvas;
})());


//基础图型约束 
Kpages.Graphic.Base = Kpages.Graphic.Base || ((function(){
    var Base =function(){}
    Base.prototype= {
        Width:0,
        Height:0,
        MouseEvn:["over","out","_click","down","up"],
        DrawEvn:["starting","drawing","stop"],
        InitMouseEvn:function(){//初始化Mouse事件 "over","out","click","down","up"
            for(var i=0;i<this.MouseEvn.length;i++){
                evn = this.MouseEvn[i];
                if(this[evn]==null){
                    this[evn] = new W.Delegate();
                    var self = this;
                    (function(evn){
                        self["mouse"+evn] = function(fn){ self[evn].Add(fn);};
                    })(evn);
                }
            }
            this["click"] = this["mouse_click"];
        },
        InitDrawEvn:function(){//初始化画图事件，开始，正在画，结束
            for(var i=0;i<this.DrawEvn.length;i++){
                evn = this.DrawEvn[i];
                if(this[evn]==null){
                    this[evn] = new W.Delegate();
                    var self = this;
                    (function(evn){
                        self["on"+evn] = function(fn){ self[evn].Add(fn);};
                    })(evn);
                }
            }
        },
        unBind:function(delegate,fn){//解除对事件的委托
        	delegate = delegate.replace("mouse","");
        	this[delegate].Remove(fn);
        }
    }
    return Base;
})())

/**
 多图形对象容器
**/
Kpages.Graphic.Sprite = Kpages.Graphic.Sprite || ((function(){
    var Sprite = function(opts){ this.Init(opts);}
    Co.Inheritance(Kpages.Graphic.Base,Sprite);
    Co.extend({
        Opts:null,
        Childs:[],
        Init:function(opts,fill){
            this.Opts = opts;
            this.InitMouseEvn();
        },
        InRange:function(m){ //需要支持Mouse、Click 等事件时，此方法必须实现

        },
        Append:function(graphic){ //添加子对象
        	this.Width = Math.max(this.Width,graphic.Width);
        	this.Height = Math.max(this.Height,graphic.Height);
        	this.Childs.push(graphic);
        },
        Remove:function(graphic){//移除
        
        }
    },Sprite.prototype)
    return Sprite;
})())


//矩型
/**
    opts= {
        x,
        y,
        w,
        h,
        styles:{
            fillStyle,
            strokeStyle,
            lineWidth
        }
    }
**/
Kpages.Graphic.Rect = Kpages.Graphic.Rect || ((function(){
    var Rect = function(opts,fill){ this.Init(opts,fill);}
    Co.Inheritance(Kpages.Graphic.Base,Rect);
    Co.extend({
        Opts:null,
        Init:function(opts,fill){
            this.Opts = opts;
            this.IsFill = fill;
            this.InitMouseEvn();
        },
        InRange:function(m){ //需要支持Mouse、Click 等事件时，此方法必须实现
            var o = this.Opts;
            return o.x<=m.x && m.x<=(o.x+o.w) && o.y <= m.y && m.y<= (o.y+o.h)
        },
        Render:function(ctx){
            //todo
            this.Width = this.Opts.w;
            this.Height = this.Opts.h;
            if(this.IsFill){ //填充还是勾边
                ctx.fillRect(this.Opts.x,this.Opts.y,this.Opts.w,this.Opts.h);
            }else{
                ctx.strokeRect(this.Opts.x,this.Opts.y,this.Opts.w,this.Opts.h);
            }
        }
    },Rect.prototype)
    return Rect;
})())

//线条
/**
    opts = {
        x,
        y,
        endx,
        endy
    }
**/
Kpages.Graphic.Line = Kpages.Graphic.Line || ((function(){
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
            this.Width = this.Opts.endx - this.Opts.x;
            this.Height = this.Opts.endy - this.Opts.y;
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
Kpages.Graphic.Arc = Kpages.Graphic.Arc || ((function(){
    var Arc = function(opts){ this.Init(opts) }
    Co.Inheritance(Kpages.Graphic.Base,Arc);
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
        Render:function(ctx){//todo 不以 x,y 为圆点；以x+r,y 为圆点  ？？ 
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
Kpages.Graphic.Fences = Kpages.Graphic.Fences || ((function(){
    var Fences = function(opts,fill){ this.Init(opts,fill) }
    Co.Inheritance(Kpages.Graphic.Base,Fences);
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



/**
    Text 文字
    opts = {
        x,
        y,
        text,
        maxWidth,
        font:"",
        textAlign:start|end|left|right|center,
        textBaseline:alphabetic|top|bottom|middle|handing,
        styles:{
            
        }
    }
**/
Kpages.Graphic.Text = Kpages.Graphic.Text || ((function(){
    var Text = function(opts,fill){ this.Init(opts,fill) }
    Co.Inheritance(Kpages.Graphic.Base,Text);
    Co.extend({
        Opts:null,
        IsFill:true,
        Init:function(opts,fill){  
            this.Opts = opts;
            this.InitMouseEvn();
        },
        InRange:function(m){//需要支持Mouse、Click 等事件时，此方法必须实现
            return false;
        },
        Render:function(ctx){
            var o = this.Opts;
            if(o.font){ //样式设置
                ctx.font = o.font;
            }
            if(o.baseline)
                ctx.textBaseline = o.baseline;

            if(o.font.textAlign)
                ctx.textAlign = o.textAlign;

            if(this.IsFill){ //填充还是勾边
                ctx.fillText(o.text,o.x,o.y)
            }else{
                ctx.strokeText(o.text,o.x,o.y)
            }

            o.width = ctx.measureText(o.text).width;
        }
    },Text.prototype);
    return Text;
})())


