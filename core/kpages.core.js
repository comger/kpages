/**
 Kpages jquery 标准接口

    author      : comger 
    createdate  : 2011-08-10
    History 
        
**/

var Kpages = Kpages || { Version:'dev' };


/**
 工具类
 cookie，浏览器，验证，数据转换等**/
Kpages.Common = Kpages.Common || ((function(){
    
    var Common  = {
        extend: function(base, obj) { // 拷贝对象继承,两参数必须为对象
            for (var i in base) {
                obj[i] = base[i];}
            return obj;
        },
        Inheritance: function(base, obj) { //把base的原型复制给obj,并返回 （原型继承），两参数为类型
            for (var i in base.prototype) {
                obj.prototype[i] = base.prototype[i];}
            return obj;
        },
        Keys:function(object){ //获取所有原型属性
            var keys = [];
            for (var property in object)
              keys.push(property);
            return keys;
        },
        Values: function(object) {//获取所有值
            var values = [];
            for (var property in object)
              values.push(object[property]);
            return values;
        },
        Clone:function(object){ 
            return $.extend({}, object);
        },
        Cookie:function(name,value,opts){ // cookie 操作，读、取
            if(jQuery.cookie !=null && typeof(jQuery.cookie) == "function"){
                return jQuery.cookie(name,value,opts); 
            }else{// to do somethings
                return false;
            }
        },
        LocalStorage:function(key,val){
            // to do
        },
        IsHtml5:function(){ // 是否为html5 支持浏览器
            return false;
        },
        LoadScript:function(src){
            var script = $("<script>").attr("type","text/javascript").attr("src",src);
            $("head")[0].appendChild(script[0]);
        },
        CustomDict:function(dict,key,val){ //自定义字典
           if(val){
                dict[key]=val;
           }else{
                if(typeof(key)=="string"){
                    return dict[key];
                }else if(typeof(key)=="object"){
                    dict = $.extend(dict,key);}
           }
        },
        ToArray: function(iterable) { 
            if (!iterable) return [];
            var length = iterable.length, results = [];
            while (length--) results[length] = iterable[length];
            return results;
        },
        Filter:function(fn,arr){ //过滤 返回满足 fn 的，arr 项数组
            var rs =[];
            for(var i=0;i<arr.length;i++){
                if(fn(arr[i]))
                    rs.push(arr[i]);
            }
            return rs;
        },
        Map:function(fn,arr){ // 映射 map函数fn 作用于给定序列的每个元素，并用一个列表来提供返回值。
            var rs = [];
            for(var i=0;i<arr.length;i++){
                rs.push(fn(arr[i]));
            }
            return rs;
        },
        //fn为二元函数，将fn作用于arr 数组的元素，每次携带一对（先前的结果以及下一个序列的元素），
        //连续的将现有的结果和下一个值作用在获得的随后的结果上，最后减少我们的序列为一个单一的返回值
        Reduce:function(fn,arr,initial){ // 化简           
            if(typeof initial === 'undefined'){
                initial = arr.shift();
            }
            for(var i=0;i<arr.length;i++){
                 initial = fn(initial,arr[i]);
            }
            return  initial;
        },
        Round:function(num,dec){ // 取最近的num ,dec为小数点后位数 默认为0
            if(typeof dec === 'undefined')
                dec =0;
            return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
        },
        GetRandomInt:function(max){ //获取 max 以内的随机整数
            return this.Round(Math.random() * max);
        },
        Timeout:function(fn,time){ //缓慢处理，对fn放缓time执行，返回这个控制对象，obj.set() 激活， obj.clear() 清除 
            var flag = false;
            return { set : function(){ 
                if(!flag){
                    flag = setTimeout(function(){
                        fn();
                        flag = false;
                    }, time);
                }}, clear : function(){
                    if(flag){
                        clearTimeout(flag);
                        flag = false;
                    }
            }}
        }
    };
    
    //注册页面简易操作符 Kpages.Common.extend(a,b) = Co.extend(a,b)
    window.Co = Common; 
    window.W = Kpages;
    return Common;
})());

//Co.Dates 工具库时期相关扩展类
Kpages.Common.Dates ={
        Convert:function(d) {//转指定参数转成日期对象 ，可接受参数为数组，日期，整数，字符串，对象
            return (
                d.constructor === Date ? d :
                d.constructor === Array ? new Date(d[0],d[1],d[2]) :
                d.constructor === Number ? new Date(d) :
                d.constructor === String ? new Date(d.replace(/-/g,"/")) :
                typeof d === "object" ? new Date(d.year,d.month,d.date) :
                NaN
            );
        },
        Compare:function(a,b) {//a,b两时间对比，-1 : if a < b，0 : if a = b，1 : if a > b，时间格式出错时返回 NaN 
            return (
                isFinite(a=this.Convert(a).valueOf()) &&
                isFinite(b=this.Convert(b).valueOf()) ?
                (a>b)-(a<b) :
                NaN
            );
        },
        InRange:function(d,start,end) { //检查时间是否在指定范围， 时间格式出错时返回 NaN 
           return (
                isFinite(d=this.Convert(d).valueOf()) &&
                isFinite(start=this.Convert(start).valueOf()) &&
                isFinite(end=this.Convert(end).valueOf()) ?
                start <= d && d <= end :
                NaN
            );
        },
        Now:function(){ //获取当前时间戳
            var d = new Date();
            return Math.floor(+d / 1000);
        }
}


//Co.Html html 工具库相关扩展类
Kpages.Common.Html ={
        Count:function(html){//针对 a 标签统计页面可见字数
            var _div = $("<div>").append(html);
            var count=0;
            Co.Map(function(item){
                count +=$(item).html().length;
            },$(_div).find("a"));
            $(_div).find("a").remove();
            return $(_div).html().length+count
        },
        BackRemove:function(html,step){//从后开始step个字，如果碰到 a 标签，则删除整个标签
            var delChars = html.substring(html.length-step,html.length);
            var start,end;
            
            if(delChars.indexOf(">")>=0){
                start = html.lastIndexOf(">");
                end =html.lastIndexOf("<a");
                var _div = $("<div>").append(html);
                $(_div).find("a").last().remove();
                html=$(_div).html();
            }
            var _temp= html.substring(0,html.length-step);
            return [_temp,start,end];
        },
        ClearTag:function(html,tag){//清除html中 tag 标签，仅保留内容,有异常 innerhtml
            var _div = $("<div>").append(html);
            Co.Map(function(item){
                _div.html(_div.html().replace(/<a[^>].*?>/g,""));
            },$(_div).find("a"));
            return _div.html();
        },
        ReplaceTag:function(html,tag,attrname){
            var r, re; // 声明变量。           
            re = new RegExp("<"+tag+"[^>].*?"+tag+">","g"); // 创建正则表达式对象。
            r = html.match(re); // 在字符串 s 中查找匹配。
            if(r || r!=null)
                for(var i=0;i<r.length;i++){
                    if(attrname)
                        html = html.replace(r[i],$(r[i]).attr(attrname))
                    else
                        html = html.replace(r[i],$(r[i]).html())
                }
            return html;
        }
}

//Co.Files 工具库文件相关扩展类
Kpages.Common.Files = {
        FormatSizes:function(size){ //获取友好的size 表达 eg 102400 byte ==> 10 KB
            var byteSize = Math.round(size / 1024 * 100) * .01;
		    var suffix = 'KB';
		    if (byteSize > 1000) {
			    byteSize = Math.round(byteSize *.001 * 100) * .01;
			    suffix = 'MB';}
		    return byteSize + suffix;
        },
        GetExtension:function(filename){//获取文件扩展名
            return ""
        }
}

/**
事件委托
**/
Kpages.Delegate = Kpages.Delegate || ((function() {
    var Delegate = function() { this.Init();}
    Delegate.prototype = {
        fns: [],
        Init: function() {
            this.fns = [];},
        Add: function(fn, self) {
            for (var i = 0; i < this.fns.length; i++) {
                if (this.fns[i][0] === fn) {
                    return;}
            }
            this.fns.push([fn, self]);
        },
        One: function(fn, self) {
            this.Add((function() {
                fn.apply(self, arguments);
                this.Remove(fn);
            }).bind(this));
        },
        Remove:function(fn) {
            if(fn){
                for (var i = 0; i < this.fns.length; i++) {
                    if (this.fns[i][0] === fn) {
                        this.fns.Remove(i);
                        return;}
                }
            }else{
                this.fns = [];
            }
        },
        Call: function() { //执行委托方法
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

/**
 Kpages ui 通用方法
**/
Kpages.UI = Kpages.UI || ((function(){
    var UI ={
        InPosition:function(exp,InExp,x,y){  //将exp 对象，浮动到 InExp 对象的位置，并进行,x ,y 偏移
            var offset = $(InExp).offset();
            var left = 300 ;
            var top = 300;
            if(offset!=null){
            left = offset.left + x ;
            top = offset.top + y;}
            $(exp).addClass("Kpages-floatDiv");
            $(exp).css({ left: left, top: top });
        },
        MoveTo:function(exp,left,top){ //将exp 对象，浮动到 left ,top 的位置
            $(exp).addClass("Kpages-floatDiv");
            $(exp).css({ left: left, top: top });
        },
        InCenter:function(exp){//将exp 对象，浮动到页面中心
            $(exp).addClass("Kpages-floatDiv");
            var left = $(window).width()/2-$(exp).width()/2;
            var top = $(document).scrollTop() + $(window).height()/2 -$(exp).height()/2;
            $(exp).css({ left: left, top: top });
        },
        AddZindex:function(exp,index){ //添加z-index 数
            index = index || 1;
            index +=$(exp).css("z-index");
            $(exp).css("z-index",index);
        },
        SetCaretPosition:function(ctrl,pos){ //设置光标位置函数,方法有异常
            //todo 
            if(ctrl.setSelectionRange) { 
                $(ctrl).focus(); 
                ctrl.setSelectionRange(pos,pos); 
            } else if (ctrl.createTextRange) { 
                var range = ctrl.createTextRange(); 
                range.collapse(true); 
                range.moveEnd('character', pos); 
                range.moveStart('character', pos); 
                range.select(); 
           }
        },
		BindDrag:function(el,dragel){ //绑定元素，使其可拖动
			el=el[0];
			var els = el.style,x = y = 0;

			$(el).mousedown(function(e){
				//按下元素后，计算当前鼠标位置
				x = e.clientX - el.offsetLeft;
				y = e.clientY - el.offsetTop;
				//IE下捕捉焦点
				el.setCapture && el.setCapture();
				//绑定事件
				$(document).bind('mousemove',mouseMove).bind('mouseup',mouseUp);
			});

			//移动事件
			function mouseMove(e){
				//宇宙超级无敌运算中...
				els.top  = e.clientY - y + 'px';
				els.left = e.clientX - x + 'px';
			}
			//停止事件
			function mouseUp(){
				//IE下释放焦点
				el.releaseCapture && el.releaseCapture();
				//卸载事件
				$(document).unbind('mousemove',mouseMove).unbind('mouseup',mouseUp);
			}
		}
    };
    window.Ui = UI;
    return UI;
})())

/**
 UI 基类，实现基本显示,附加，隐藏及回收**/
Kpages.UI.Base = Kpages.UI.Base ||((function(){
    var Base = function(){}
    Base.prototype = {
        Element: null,
        AddTo: function(exp) {
            $(exp).append(this.Element);},
        Show: function() {
            this.Element.show();},
        Hide: function() {
            this.Element.hide();},
        Destroy: function() {
            this.Element.remove();
            for (var i in this) {
                this[i] = undefined;
            }
            if (CollectGarbage) CollectGarbage();
        }
    }
    return Base;
})())

/**
   Init the framework
   重写各对象的 prototype
**/

//扩展String
Co.extend({
    toArray: function() {//将字符串转成字符数组
        return this.toString().split('');
    },
    Format:function(){ //格式化字符串
        var str = this.toString();
        for(var i=0;i<arguments.length;i++){
            str = str.replace("{"+i+"}",arguments[i]);}
        return str;
    },
    Trim:function(){
        return this.replace(/^\s+/, '').replace(/\s+$/, '');
    }
},String.prototype);


//扩展Number
Co.extend({
    Pad:function(length){ //前补0直到符合指定长度，用于数字补0
        if (!length) 
            length = 2;
        var str = '' + this;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }
},Number.prototype);

//扩展Date
Co.extend({
    SetDate:function(n){ //获取当前的+ N小时的日期
        var cur = new Date();
        cur.setHours(cur.getHours()+n);
        return cur;
    },
    ToDayLine:function(){ //获取当前时间线 当前0点
        var cur = new Date();
        cur.setHours(0),cur.setMinutes(0),cur.setSeconds(0),cur.setMilliseconds(0);
        return cur;
    },
    TimeSpan:function(){ //获取时间戳
        return Math.floor(+this / 1000);
    },
    ToKpagesDate:function(){ //转成微博所需时间格式
        var t = Co.Dates.Now() - this.TimeSpan();
        if (t < 60) return t + '秒前';
        if (t < 3600) return Co.Round( t / 60, 0) + '分钟前';
        if (t < 86400) return Co.Round( t / 3600, 0) + '小时前';
        return "{0}月{1}日 {2}:{3}".Format(this.getMonth()+1,this.getDate(),this.getHours().Pad(2),this.getMinutes().Pad(2));
    }
},Date.prototype);

// 扩展Function
Co.extend({
    Bind:function(){ //将一方法绑定在指定的对象上，在方法调用时，可执行所绑定的所绑定对象的方法计算
        var __method = this, args = Array.prototype.slice.call(arguments), object = args.shift();
        return function() {
            return __method.apply(object, args.concat(Array.prototype.slice.call(arguments)));
        }
    },
    BindAsEventListener:function(object){ //将方法绑定在指定对象上，并提供调用监听
        var __method = this, args = Array.prototype.slice.call(arguments), object = args.shift();
        return function(event) {
            return __method.apply(object, [( event || window.event)].concat(args).concat(Array.prototype.slice.call(arguments)));
        }
    },
    Param:function(){ //获取方法参数
       var names = this.toString().match(/^[\s\(]*function[^(]*\((.*?)\)/)[1].replace(/ /gm, '').split(',');
       return names.length == 1 && !names[0] ? [] : names;
    }

},Function.prototype);

//扩展 Array 
Co.extend({
    Remove:function(index,count){ //移除index 开始的指定个数，默认个数为1
        if(count){
            if (isNaN(index) || index > this.length)
                return false
            this.splice(index, count);
            return this;
        }else{
            return this.Remove(index, 1);
        }
    },
    RemoveKey:function(key){ //按指定key 移除
       for (var i = 0; i < this.length; i++) {
            if (this[i] === value || this[i] == value)
                return this.Remove(i);
       }
       return this;
    },
    IndexOf:function(value){ //计算 val 在数组的 index
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value || this[i] == value)
               return i
        }
        return NaN;
    }
},Array.prototype);


/**
  数据交互类
**/

Kpages.Data = Kpages.Data ||{};
//数据源类
Kpages.Data.DataSource = Kpages.Data.DataSource || ((function(){
    var Datasource = function(url){ this.Init(url);}
    Datasource.prototype = {
        Params: {}, //参数
        ServerUrl:'null',
        Changes:null, //变化中，用于预处理数据
        OnChanging:null, // 变化前
        OnChanged:null,//变化后事件
        Init:function(url){
            this.ServerUrl = url || '#';
            this.Params = {};
            this.OnChanged = new W.Delegate();
            this.Changes = new W.Delegate();
            this.OnChanging = new W.Delegate();
        },
        Load:function(p){
            this.OnChanging.Call();
            for (var i in p) {
                this.Params[i] = p[i];
            }
            var self = this;
            $.ajax({
                type: 'GET',
                url: self.ServerUrl,
                data: self.Params,
                cache: false,
                success: function(data) { // 处理返回结果里通知的异常
                    var d = self.Changes.Call(data);
                    self.OnChanged.Call(d || data);
                },
                error: function(xhr) {
                    // to do 
                }
            });
        }
    }
   
    return Datasource;
})())

//定时加载的数据源
Kpages.Data.TimingDataSource = Kpages.Data.TimingDataSource ||((function(){
    var TimingDataSource = function(url) { this.Init_(url);}
    Co.Inheritance(Kpages.Data.DataSource, TimingDataSource);
    Co.extend({
            Time: 60, //定时载入时间（秒）
            _t: null,
            IsUptate: true,
            Init_: function(url) {
                this.Init(url);
                this.Load__ = this.Load;
                this.Load = this.Load_;
                this.Destroy__ = this.Destroy;
                this.Destroy = this.Destroy_;
            },
            Load_: function(obj) {
                obj = obj || {};
                if (this.IsUptate) {
                    this.Load__(obj);
                }
                clearTimeout(this._t);
            },
            Destroy_: function() {
                this.Destroy__();
                clearTimeout(this._t);
            }
        }, TimingDataSource.prototype);
    return TimingDataSource;
})())

//数据输出基类
Kpages.Data.BaseRender = Kpages.Data.BaseRender || ((function(){
    var BaseRender = function(){}
    BaseRender.prototype = {
        Self:{
            DataSource:null, //数据源对象或为数据集
            OnChanging:null,
            Changes:null
        },
        Databind:function(){
            var self = this.Self;
            if (self.DataSource.Load) {//为动态数据源
                self.DataSource.OnChanging.Add(function() {
                    if(OnChanging && typeof(OnChanging)=="function"){
                         self.OnChanging();}
                }, this);
                self.DataSource.Changes.Add((function(e){
                    if(Changes && typeof(Changes)=="function"){
                         self.Changes(e);}
                }).bind(this),this);
                self.DataSource.OnChanged.Add((function(e) {
                    if (e.constructor !== Array) {
                        e = e.Data;}
                    this.Render(e);
                }).bind(this), this);
            }else {
                //直接提供数据集的时候
                this.Render(self.DataSource);
            }
        },
        Render:function(data){

        }
    };
    return BaseRender;
})())


/**
    客户端内存数据管理器，为页面提供静态数据，允许固化数据
    页面刷新时，数据初始化
**/
Kpages.StaticObjs = Kpages.StaticObjs || ((function(){
    var StaticObjs = function(){ this.Init()}
    StaticObjs.prototype = {
        LConfig:{
            domain:'Kpages.com', //当前域
            skin:null, //当前皮肤
            uid:null, //当前用户ID
            nickname:null
        },
        DataDict:{}, //数据组
        Model:"cookie",
        BaseKey:"bf_",
        Expre:"1000*60*60*24",
        Init:function(){
            this.Restore();
            //window.onbeforeunload = this.Curing();
        },
        Config:function(key,val){ //设置为获取配置值,可被固化
            return Co.CustomDict(this.LConfig,key,val);
        },
        Curing:function(){//固化数据
            if(this.Model=="cookie"){
                for(var i in this.LConfig){
                    try{
                        Co.Cookie(this.BaseKey+i,this.LConfig[i],this.Expre);
                    }catch(exp){//允许失败
                    }
                }}
        },
        Restore:function(){//还原保存在cookie里的配置信息
            this.LConfig = $.extend(this.LConfig,Co.CookieStartWith("bf_",true));
        },
        Dict:function(key,val){ //数据字典
            return Co.CustomDict(this.DataDict,key,val);
        }
    };
    return StaticObjs;
})())

/**
 Url 操作
        get(key,url)    //返回请求参数值
		解析URL地址
		myURL.file;     // = 'index.html'  	
		myURL.hash;     // = 'top'  	
		myURL.host;     // = 'abc.com'  	
		myURL.query;    // = '?id=255&m=hello'  	
		myURL.params;   // = Object = { id: 255, m: hello }  	
		myURL.path;     // = '/dir/index.html'  	
		myURL.segments; // = Array = ['dir', 'index.html']  	
		myURL.port;     // = '8080'  	
		myURL.protocol; // = 'http'  	
		myURL.source;   // = 'http://abc.com:8080/dir/index.html?id=255&m=hello#top' 
**/

/**
  Browser
  Browser.name
  Browser.version
  Browser.uga
  Browser.lang
  Browser.mobile
**/

/**
Validate, //验证模块
    Validate.Array( object ),
    Validate.Function( object ),
    Validate.Object( object ),
    Validate.Date( object ),
    Validate.Number( object ),
    Validate.String( object ),
    Validate.Defined( object ),
    Validate.Empty( object ),
    Validate.Boolean( object ),
    Validate.Window( object ),
    Validate.Document( object ),
    Validate.Element( object ),
    Validate.Chinese( string[, all] ),
    Validate.Safe( string ),
    Validate.Email( string ),
    Validate.URL( string ),
    Validate.IP( string ),
    Validate.ID( string ),
    Validate.Password( string ),
    Validate.Color( string ),
    Validate.Phone( string ),
    Validate.Mobile( string )
**/



