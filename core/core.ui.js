/**
    Kpages ui 扩展库
    author      : comger 
    createdate  : 2011-12-13
    History 
**/

Kpages.Ui = {
	skin:"skin",
	dragable:function(el,handler){
        el=el[0];
	    var els = el.style,
		    x = y = 0;

	    $(handler).mousedown(function(e){//按下元素后，计算当前鼠标位置
		    x = e.clientX - el.offsetLeft;
		    y = e.clientY - el.offsetTop;
		    el.setCapture && el.setCapture();//IE下捕捉焦点
		    $(document).bind('mousemove',mouseMove).bind('mouseup',mouseUp);
	    });
	    function mouseMove(e){//移动事件
		    els.top  = e.clientY - y + 'px';
		    els.left = e.clientX - x + 'px';
	    }
	    function mouseUp(){//停止事件
		    el.releaseCapture && el.releaseCapture();//IE下释放焦点
		    $(document).unbind('mousemove',mouseMove).unbind('mouseup',mouseUp);
	    }
	},
	inCenter:function(exp){//ui 控件置空
        $(exp).addClass("floatDiv");
        var left = $(window).width()/2-$(exp).width()/2;
        var top = $(document).scrollTop() + $(window).height()/2 -$(exp).height()/2;
        $(exp).css({ left: left, top: top });
	},
	createMark:function(){//创建mask
	    var _div = $("#_DialogBGDiv");
        if(_div.length==0){
            _div =$('<div id="_DialogBGDiv" class="mask">').css({width:screen.width,height:screen.height});
            $("body").prepend(_div);
        }
        
        if(_div.attr("ref")){ _div.attr("ref",parseInt(_div.attr("ref"))+1)}
        else{ _div.attr("ref",1)}
        
        return _div;
    }
}
window.Ui = Kpages.Ui;


//Ui基类，不能实例化
Kpages.Ui.Base = Class({
    element: null,
    addTo: function(exp) {
        $(exp).append(this.element);
    },
    show: function() {
        this.element.show();
    },
    hide: function() {
        this.element.hide();
    },
    destroy: function() {
        this.element.remove();
        for (var i in this) {
            this[i] = undefined;
        }
        if (CollectGarbage) CollectGarbage();
    },
    addEvn:function(evn){//添加事件; evn 为事件名称
        var self = this;
        self[evn] = new Kpages.Delegate();
        (function(evn){
            self["on"+evn] = function(fn){ self[evn].add(fn,self);};
        })(evn);
    }
})

//Ui 容器
Kpages.Panel = Class(Ui.Base,{
	controls:null,
	init:function(n,i){
        this.controls = [];
        if (i == undefined) {
            i = n;
            this.element = $('<span></span>');
        }else {
            this.element = $(n);}
        if (i) {
            this.show()
        }else {
            this.hide();}
	},
	add:function(obj){
        if (obj.element) {
            this.element.append(obj.element);
            this.controls.push(obj);
        }
        else {
            this.element.append($(obj));
        }
        return this;
	},
	remove:function(obj){
		if(obj){
	        if (obj.element) {
	            obj.element.remove();
	            this.controls.RemoveKey(obj);
	        }
	        else {
	            $(obj).remove();
	        }
		}else{
	        this.element.remove();
	        this.Controls = [];
		}
	}
})


/**
    分页控件
    var paging = new Ui.Paging({
        nextText: '下一页',
        previousText: '上一页',
        indexText: '第一页',
        lastText: '末一页',
        style: 'padding-top:10px;',
        cssClass: 'pagingbar',
        hoverCls: 'hover',
        currentIndex: 0, //当前为第几页
        total: 0 //总页数
    })
**/
Kpages.Ui.Paging = Class(Ui.Base,{
    opts:{
        nextText: '下一页',
        previousText: '上一页',
        indexText: '第一页',
        lastText: '末一页',
        style: 'padding-top:10px;',
        cssClass: 'pagingbar',
        hoverCls: 'hover',
        currentIndex: 0, //当前为第几页
        total: 0 //总页数
    },
	init:function(opts){
	    Uti.extend(this.opts,opts);
        this.addEvn("Change");
        this.element = $('<p></p>');
        this.render();
	},
	render:function() {
	    var opts = this.opts;
		this.element.attr('class', opts.cssClass).attr('style', opts.style);
        if (opts.total > 1) {
            var el = this.element;
            el.append($('<a href="#" class="page_index"></a>').click(this.index.bind(this)).html(opts.indexText));
            el.append($('<a href="#" class="page_previous"></a>').click(this.previous.bind(this)).html(opts.previousText));
            
            for (var i = 0; i < opts.total; i++) {
                if (opts.currentIndex != i) {
                    el.append($('<a href="#"></a>').click(this.go.bind(this, i)).html(i + 1));
                }else {
                    el.append($('<a href="#"></a>').attr('class', opts.hoverCls).click(function() { return false; }).html(i + 1));
                }
            }
             
            el.append($('<a href="#" class="page_next"></a>').click(this.next.bind(this)).html(opts.nextText));
            el.append($('<a href="#" class="page_last"></a>').click(this.last.bind(this)).html(opts.lastText));
        }
        else {
            this.hide();
        }
	},
    next: function() {//下在页
        return this.go(this.opts.currentIndex + 1);
    },
    previous: function() {//上一页
        return this.go(this.opts.currentIndex - 1);
    },
    index: function() {//首页
        return this.go(0);
    },
    last: function() {//末页
        return this.go(this.opts.total - 1);
    },
    go: function(index) {
        var opts = this.opts;
        if (index > opts.total - 1) {
            opts.currentIndex = opts.total - 1;
            this.element.find(".page_next,.page_last").hide();
        }
        else if (index <= 0) {
            opts.currentIndex = 0;
            this.element.find(".page_index,.page_previous").hide();
        }
        else {
            opts.currentIndex = index;
        }
        
        this.Change.call(opts.currentIndex);
        return false;
    }
})


/**
    Ui Dialog 
    var dailog = new Ui.Dialog({
        ID:false,
        Title:'对话框',
        URL:false,
        InnerHtml:false,
        InvokeElementId:false,
        Width:'400px',
        Height:'300px',
        Top:'20%',
        Left:'30%',
        Drag:true,
        Mark:true,
        ShowButtonRow:false,
        FuncOK:null
    })
**/
Kpages.Ui.Dailog = Class(Ui.Base,{
    opts:{
        id:false,
        title:'对话框',
        url:false,
        innerHtml:false,
        invokeElementId:false,
        width:400,
        height:300,
        drag:true,
        mark:true,
        showButtonRow:false,
        funcOK:null
    }, 
    init:function(opts){
        Uti.extend(this.opts,opts);
        var _id = "";
        if(!this.opts.id){//自动生成对话框ID
            _id ='d_dialog_'+Kpages.Ui.Dailog.count;}
        
        var el = this.element = $('#'+_id);
        if(el.length == 0){ 
            el = this.element = $("<div id='"+_id +"' class='d_dialog'></div>");
            $('body').append(el);
            Kpages.Ui.Dailog.count +=1;
            this.initDialog();
            this.initFun();
            this.setContent();
         }
    },
    initDialog:function(){//初始化对话框样式及标题
        var opts = this.opts;
        this.element.css('width',opts.width).css('height',opts.height);
        var toolbar =$('<div class="d_toolbar">'+opts.title+'<div class="jBoxControls"><button title="关闭" id="btn_close"></button></div></div>');
        this.element.append(toolbar);
        var _content=$('<div class="d_content">').css("height",opts.height-35);
        this.element.append(_content); //添加容器
        Ui.dragable(this.element,this.element.find(".d_toolbar"));
        Ui.inCenter(this.element);
    },
    initFun:function(){
         this.element.find('#btn_close').bind("click",(function(){
            this.element.hide();
            var ref = parseInt($("#_DialogBGDiv").attr("ref"))-1;
            $("#_DialogBGDiv").attr("ref",ref)
            if(ref==0){
                $("#_DialogBGDiv").hide();
            }
         }).bind(this))
    },
    setContent:function(){
        if(this.opts.url){//加载 url 内容
            var ifr ='<iframe height="100%" frameborder="0" width="100%" src="'+this.opts.url+'" id="_DialogFrame_'+Kpages.Ui.Dailog.count+'" allowtransparency="true" style="border: 0pt none;"></iframe>';
            this.element.find('.d_content').append(ifr);
        }else if(this.opts.innerHtml){ //加载 参数内容
            this.element.find('.d_content').append(this.opts.innerHtml);
        }else if(this.opts.invokeElementId){ //加载指定对象的内容
            //$('#'+this.opts.invokeElementId).hide();
            this.element.find('.d_content').append($('#'+this.opts.invokeElementId));
        }
        var mask = Ui.createMark();
        this.element.show();
    },
    setStyle:function(style){
        this.element.css(style);
    }
})

Kpages.Ui.Dailog.count = 0;


