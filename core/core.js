/**
    Kpages jquery 扩展库
    author      : comger 
    createdate  : 2011-12-12
    History 
**/


var Kpages = Kpages || { Version:'dev' };

//复制对象属性，扩展对象
Object.prototype.extend = function(base){
    $.extend(this,base);
}

/**
  Kpages core 面向对象模拟扩展
  Demo
	var DemoClass = Class({
		opts:{
			id:"a1",
			width:20
		},
		print:function(){
			console.log("this's democlass print");
		}
	})

	var SpClass = Class(DemoClass,{
		opts:{
			height:30
		},
		init:function(opts){
			$.extend(this.opts,opts);
		},
		printObj:function(obj){
			console.log(this.opts);
		}
	})
**/
window.Class = Kpages.Class =function(a,b){
	var cls = function(){ this.__init__.apply(this, arguments)}
	cls.prototype = {
		__id:undefined,
		__init__:function(){
			if(this.init){ this.init.apply(this,arguments);}
		}
	}
	
	function _extend(c1,c2){//针对对象属性继承覆盖与扩展
		if(typeof c1 == 'object' && typeof c2 != 'undefined'){ 
			$.extend(c1,c2);
		}else{ c1 = c2; }
		return c1;
	}
	
	if(b){
		for(i in a.prototype){ cls.prototype[i] = _extend(cls.prototype[i],a.prototype[i])}
		for(i in b){ cls.prototype[i] = _extend(cls.prototype[i],b[i])}
	}else{
		$.extend(cls.prototype,a);
	}
	return cls;
}

//事件委托
Kpages.Delegate = Kpages.Delegate || ((function() {
    var Delegate = function() { this.init();}
    Delegate.prototype = {
        fns: [],
        init: function() {
            this.fns = [];},
        add: function(fn, self) {
            for (var i = 0; i < this.fns.length; i++) {
                if (this.fns[i][0] === fn) {
                    return;}
            }
            this.fns.push([fn, self]);
        },
        one: function(fn, self) {
            this.add((function() {
                fn.apply(self, arguments);
                this.remove(fn);
            }).bind(this));
        },
        remove:function(fn) {
            if(fn){
                for (var i = 0; i < this.fns.length; i++) {
                    if (this.fns[i][0] === fn) {
                        this.fns.remove(i);
                        return;}
                }
            }else{
                this.fns = [];
            }
        },
        call: function() { //执行委托方法
            var result;
            for (var i = 0; i < this.fns.length; i++) {
                var ret = this.fns[i][0].apply(this.fns[i][1], arguments);
                result = ret == undefined ? result : ret;
            }
            return result;
        }
    };
    return Delegate;
})());


//通用方法对象
Kpages.Utility = {
    filter:function(fn,arr){ //过滤 返回满足 fn 的，arr 项数组
        var rs =[];
        for(var i=0;i<arr.length;i++){
            if(fn(arr[i]))
                rs.push(arr[i]);
        }
        return rs;
    },
    map:function(fn,arr){ // 映射 map函数fn 作用于给定序列的每个元素，并用一个列表来提供返回值。
        var rs = [];
        for(var i=0;i<arr.length;i++){
            rs.push(fn(arr[i]));
        }
        return rs;
    },
    //fn为二元函数，将fn作用于arr 数组的元素，每次携带一对（先前的结果以及下一个序列的元素），
    //连续的将现有的结果和下一个值作用在获得的随后的结果上，最后减少我们的序列为一个单一的返回值
    reduce:function(fn,arr,initial){ // 化简           
        if(typeof initial === 'undefined'){
            initial = arr.shift();
        }
        for(var i=0;i<arr.length;i++){
             initial = fn(initial,arr[i]);
        }
        return  initial;
    },
    round:function(num,dec){ // 取最近的num ,dec为小数点后位数 默认为0
        if(typeof dec === 'undefined')
            dec =0;
        return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
    },
    getRandomInt:function(max){ //获取 max 以内的随机整数
        return this.Round(Math.random() * max);
    },
    extend:function(a,b){
    	a = $.extend(a,b);
    }
}

window.Uti = Kpages.Utility; 

//Uti.Date 工具库时期相关扩展类
Uti.Date = {
    convert:function(d) {//转指定参数转成日期对象 ，可接受参数为数组，日期，整数，字符串，对象
        return (
            d.constructor === Date ? d :
            d.constructor === Array ? new Date(d[0],d[1],d[2]) :
            d.constructor === Number ? new Date(d) :
            d.constructor === String ? new Date(d.replace(/-/g,"/")) :
            typeof d === "object" ? new Date(d.year,d.month,d.date) :
            NaN
        );
    },
    compare:function(a,b) {//a,b两时间对比，-1 : if a < b，0 : if a = b，1 : if a > b，时间格式出错时返回 NaN 
        return (
            isFinite(a=this.Convert(a).valueOf()) &&
            isFinite(b=this.Convert(b).valueOf()) ?
            (a>b)-(a<b) :
            NaN
        );
    },
    inRange:function(d,start,end) { //检查时间是否在指定范围， 时间格式出错时返回 NaN 
       return (
            isFinite(d=this.Convert(d).valueOf()) &&
            isFinite(start=this.Convert(start).valueOf()) &&
            isFinite(end=this.Convert(end).valueOf()) ?
            start <= d && d <= end :
            NaN
        );
    },
    now:function(){ //获取当前时间戳
        var d = new Date();
        return Math.floor(+d / 1000);
    }
}

//Uti.File 工具库文件相关扩展类
Uti.File = {
    formatSizes:function(size){ //获取友好的size 表达 eg 102400 byte ==> 10 KB
        var byteSize = Math.round(size / 1024 * 100) * .01;
	    var suffix = 'KB';
	    if (byteSize > 1000) {
		    byteSize = Math.round(byteSize *.001 * 100) * .01;
		    suffix = 'MB';}
	    return byteSize + suffix;
    }
}


/**
   Init the framework
   重写各对象的 prototype
**/

//扩展String
Uti.extend(String.prototype,{
    toArray: function() {//将字符串转成字符数组
        return this.toString().split('');
    },
    format:function(){ //格式化字符串
        var str = this.toString();
        for(var i=0;i<arguments.length;i++){
            str = str.replace("{"+i+"}",arguments[i]);}
        return str;
    },
    trim:function(){
        return this.replace(/^\s+/, '').replace(/\s+$/, '');
    }
})

Uti.extend(Number.prototype,{
    pad:function(length){ //前补0直到符合指定长度，用于数字补0
        if (!length) 
            length = 2;
        var str = '' + this;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }
})

Uti.extend(Date.prototype,{
    dateFromNow:function(n){ //获取当前的+ N小时的日期
        var cur = new Date();
        cur.setHours(cur.getHours()+n);
        return cur;
    },
    toTimeSpan:function(){ //转换成时间戳
        return Math.floor(+this / 1000);
    },
    toSpanDate:function(){ //转成时间轴格式
        var t = Co.Dates.Now() - this.TimeSpan();
        if (t < 60) return t + '秒前';
        if (t < 3600) return Co.Round( t / 60, 0) + '分钟前';
        if (t < 86400) return Co.Round( t / 3600, 0) + '小时前';
        return "{0}月{1}日 {2}:{3}".Format(this.getMonth()+1,this.getDate(),this.getHours().Pad(2),this.getMinutes().Pad(2));
    }
})

Uti.extend(Function.prototype,{
    bind:function(){ //将一方法绑定在指定的对象上，在方法调用时，可执行所绑定的所绑定对象的方法计算
        var __method = this, args = Array.prototype.slice.call(arguments), object = args.shift();
        return function() {
            return __method.apply(object, args.concat(Array.prototype.slice.call(arguments)));
        }
    },
    param:function(){ //获取方法参数
       var names = this.toString().match(/^[\s\(]*function[^(]*\((.*?)\)/)[1].replace(/ /gm, '').split(',');
       return names.length == 1 && !names[0] ? [] : names;
    }
})

Uti.extend(Array.prototype,{
    remove:function(index,count){ //移除index 开始的指定个数，默认个数为1
        if(count){
            if (isNaN(index) || index > this.length)
                return false
            this.splice(index, count);
            return this;
        }else{
            return this.Remove(index, 1);
        }
    },
    removeKey:function(key){ //按指定key 移除
       for (var i = 0; i < this.length; i++) {
            if (this[i] === value || this[i] == value)
                return this.Remove(i);
       }
       return this;
    },
    indexOf:function(value){ //计算 val 在数组的 index
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value || this[i] == value)
               return i
        }
        return NaN;
    }
})

//验证对象
Kpages.Validate = {
	Array : function(obj){//判断对象是否是数组
		return Object.prototype.toString.apply(obj) === '[object Array]';
	},
	Function : function(obj){//判断对象是否是函数
		return Object.prototype.toString.apply(obj) === '[object Function]';
	},
	Object : function(obj){//判断对象是否是对象
		return Object.prototype.toString.apply(obj) === '[object Object]';
	},
	Date : function(o){//日期
		//验证字符串
		if( typeof o == 'string' ){				 
			 return o.match(/^(\d{4})(\-)(\d{1,2})(\-)(\d{1,2})(\s{1})(\d{1,2})(\:)(\d{1,2})/) != null || o.match(/^(\d{4})(\-)(\d{1,2})(\-)(\d{1,2})/) != null;				
		}else{
			//验证对象
			return Object.prototype.toString.apply(o) === '[object Date]';
		}
	},
	Number : function(o) {//数值
		return !isNaN( parseFloat( o ) ) && isFinite(o);
	},
	String : function(o){//字符串
		return typeof o === 'string';
	},
	Defined : function(o){//未定义
		return typeof o != 'undefined';
	},
	Empty : function(o){//对象是否为空
		return typeof o == 'undefined' || o == '' ;
	},
	Boolean : function(o){//布尔
		return typeof o === 'boolean';
	},
	Window : function(o){//是否为Window对象			
		return /\[object Window\]/.test( o );
	},
	Document : function(o){//是否为HTML根
		return /\[object HTMLDocument\]/.test( o );
	},
	Element : function(o){//是否为HTML元素
		return o.tagName ? true : false;
	},
	Safe : function(str){//检查是否含有特殊字符
		var chkstr,i;
		chkstr="'*%@#^$`~!^&*()=+{}\\|{}[];:/?<>,.";
		for (i=0;i<str.length;i++){
			if (chkstr.indexOf(str.charAt(i))!=-1) return false;
		}
		return true;
	},
	Email : function(str){//检查是否为电子邮件地址	
		return /^\s*([A-Za-z0-9_-]+(\.\w+)*@(\w+\.)+\w{2,3})\s*$/.test(str);
	},
	URL : function(str){//检查是否为URL地址		
		return /^[a-zA-z]+:\/\/(\w+(-\w+)*)(\.(\w+(-\w+)*))*(\?\S*)?$/.test(str);
	},
	IP : function(str){//检查是否为合法IP
		return /^[0-9.]{1,20}$/.test(str);
	},
	Password : function(str){//检查是否为合法密码
		return /^(\w){6,20}$/.test(str);
	},
	Color : function(str){//检查是否为颜色值
		return /^#(\w){6}$/.test(str);
	},
	Phone : function(str){//校验普通电话、传真号码：可以“+”开头，除数字外，可含有“-”
		return /(?:^0{0,1}1\d{10}$)|(?:^[+](\d){1,3}1\d{10}$)|(?:^0[1-9]{1,2}\d{1}\-{0,1}[2-9]\d{6,7}$)|(?:^\d{7,8}$)|(?:^0[1-9]{1,2}\d{1}\-{0,1}[2-9]\d{6,7}[\-#]{1}\d{1,5}$)/.test(str);
	},
	Mobile : function(str){//校验手机号码：必须以数字开头，除数字外，可含有“-”
		return /^[1][0-9]{10}$/.test(str);
	}
}

window.Val = Kpages.Validate;



