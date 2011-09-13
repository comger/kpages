/**
 jQuery Graphic 图型处理类库
    author      : comger 
    createdate  : 2011-08-10
    History 
        
**/

/**
 图型容器类
 功能清单
    Clear() 清空容器
    
**/

Weibo.Graphic = Weibo.Graphic || {}

Weibo.Graphic.Canvas = Weibo.Graphic.Canvas || ((function(){
    var Canvas = function(exp){ this.Init(exp) };
	Canvas.prototype = {
		Options:{
			offset:null
		},
		Graphics:[], //所有图型列表
		OldGraphics:[],
		Ctx:null,
        CurGrgph:null, //光标所在的图形
        EndPos:null, // 图型结束点
        Canvas:null,
		Init:function(exp){
            this.Canvas = $(exp);
			this.Ctx = $(exp)[0].getContext('2d');
			var _offset = this.Options.offset = $(exp).offset();
            var self = this;

            //初始化画笔线条样式
            this.Ctx.prototype = {
                fillStyle:'#000',
                strokeStyle:'blue',
                lineWidth:1
            }

			$(exp).mousemove(function(e){ // 移动事件支持
				var m ={ x:e.clientX, y:e.clientY};
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
            this.Ctx.fillStyle = styles.fillStyle ||  this.Ctx.prototype.fillStyle;
            this.Ctx.strokeStyle = styles.strokeStyle || this.Ctx.prototype.strokeStyle;
            this.Ctx.lineWidth = styles.lineWidth || this.Ctx.prototype.lineWidth;
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
            ctx.moveTo(this.Opts.x,this.Opts.y);
            ctx.lineTo(this.Opts.endx,this.Opts.endy);
            ctx.stroke();
        }
    }
    return Line;
})())
