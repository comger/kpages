/**
 UML 基础类库
 author comger
**/


//UML图型约束 
Kpages.Graphic.Uml = Kpages.Graphic.Uml || ((function(){
    var Uml = function(){}
    Co.Inheritance(Kpages.Graphic.Base,Uml);
    Co.extend({
        line:function(ctx,p1,p2){
			ctx.beginPath();
			ctx.moveTo(p1.x,p1.y);
			ctx.lineTo(p2.x,p2.y);
			ctx.closePath();
			ctx.stroke();
        },
        text:function(ctx,str){
        	//ctx.strokeText(pro,this.Opts.x+5,offsetTop+15);
        }
    },Uml.prototype)
    return Uml;
})())


/**
类图 GaClass
var gaclass = Kpages.Graphic.GaClass({
	x,
	y,
	w,
	h,
	data:{
		cls:"ClassA",
		propertys:["a:int","b:string"],
		methods:[
			{
				name:saveToDb,
				params:["a:int","b:string"],
				reutrntype:string
			},
			{
				name:parseToInt,
				params:["b:string"],
				reutrntype:int
			},
		]
	}
})
**/
Kpages.Graphic.GaClass = Kpages.Graphic.GaClass ||((function(){
	var gaclass = function(opts){ this.Init(opts)}
	Co.Inheritance(Kpages.Graphic.Uml,gaclass);
    Co.extend({
    	Opts:null,
    	line_height:26,
		Init:function(opts){
			opts.w = 200;
			opts.h = ($(opts.data.propertys).size()+$(opts.data.methods).size()+1)*this.line_height;
			this.Opts = opts;	
			this.InitMouseEvn();
		},
        InRange:function(m){ //需要支持Mouse、Click 等事件时，此方法必须实现
            var o = this.Opts;
            return o.x<=m.x && m.x<=(o.x+o.w) && o.y <= m.y && m.y<= (o.y+o.h)
        },
        Render:function(ctx){
			ctx.strokeRect(this.Opts.x,this.Opts.y,this.Opts.w,this.Opts.h);
			ctx.strokeText(this.Opts.data.cls,this.Opts.x+5,this.Opts.y+15);
			
			offsetTop = this.Opts.y+this.line_height;
			offsetLeft = this.Opts.x+this.Opts.w;
			this.line(ctx,Ga.NewPoint(this.Opts.x,offsetTop),
				Ga.NewPoint(offsetLeft,offsetTop));
	
			Co.Map((function(pro){
				ctx.strokeText(pro,this.Opts.x+5,offsetTop+15);
				offsetTop +=this.line_height;
				this.line(ctx,Ga.NewPoint(this.Opts.x,offsetTop),
					Ga.NewPoint(offsetLeft,offsetTop));
			}).Bind(this),this.Opts.data.propertys);
			
			
			Co.Map((function(method){
				_temp = "{0}({1}):{2}".Format(method.name,method.params.join(","),method.reutrntype)
				ctx.strokeText(_temp,this.Opts.x+5,offsetTop+15);
				offsetTop +=this.line_height;
				this.line(ctx,Ga.NewPoint(this.Opts.x,offsetTop),
					Ga.NewPoint(offsetLeft,offsetTop));
			}).Bind(this),this.Opts.data.methods);
			
        }
    },gaclass.prototype)
    
    return gaclass;
})())


