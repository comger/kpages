/**
    Kpages ui 扩展库
    author      : comger 
    createdate  : 2011-12-13
    History 
**/

Kpages.Ui = {
	skin:"skin"
}
window.Ui = Kpages.Ui;


//Ui基类，不能实例化
Kpages.Ui.Base = Kpages.Ui.Base || ((function(){
	var base = function(){}
	base.prototype = {
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
        }
	}
	return base;
})())

//Ui 容器
Kpages.Panel = Kpages.Panel || ((function(){
	var panel = function(n,i){ this.init(n,i)}
	panel.inheritance(Ui.Base,{
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
	return panel;
})())

//分页控件
Kpages.Ui.Paging = Kpages.Ui.Paging ||((function(){
	var paging = function(){　this.init()}
	paging.inheritance(Ui.Base,{
        nextText: '下一页',
        previousText: '上一页',
        indexText: '第一页',
        lastText: '末一页',
        style: 'padding-top:10px;',
        cssClass: 'pagingbar',
        hoverCls: 'hover',
        count: 10, //每页数据量
        pagingCount: 10, //分页显示的数量
        currentIndex: 3, //当前为第几页
        totalCount: null, //总页数
        total: null, //数据总量
        dataSource: null, //数据源
		init:function(){
            this.onChange = new Kpages.Delegate();
            this.element = $('<p></p>');
		},
		render:function(data) {
			this.element.attr('class', this.cssClass).attr('style', this.style);
			this.total = data.total; //todo
			var tCount = this.totalCount = Math.ceil(this.total / this.count);
            if (tCount > 1) {
                var min = Math.ceil(this.currentIndex - this.pagingCount / 2);
                min = min < 0 ? 0 : min;
                var max = min + this.pagingCount;
                if (max + 1 > tCount) {
                    min -= max + 1 - tCount;
                    max = tCount;
                }
                min = min < 0 ? 0 : min;
                var el = this.element;
                el.html('');
                if (this.currentIndex == 0) {
                    el.append($('<span></span>').html(this.indexText));
                    el.append($('<span></span>').html(this.previousText));
                }
                else {
                    el.append($('<a href="#"></a>').click(this.index.bind(this)).html(this.indexText));
                    el.append($('<a href="#"></a>').click(this.previous.bind(this)).html(this.previousText));
                }
                for (var i = min; i < max; i++) {
                    if (this.currentIndex != i) {
                        el.append($('<a href="#"></a>').click(this.go.bind(this, i)).html(i + 1));
                    }
                    else {
                        el.append($('<a href="#"></a>').attr('class', this.hoverCls).click(function() { return false; }).html(i + 1));
                    }
                }
                if (this.currentIndex == tCount - 1) {
                    el.append($('<span></span>').html(this.nextText));
                    el.append($('<span></span>').html(this.lastText));
                }
                else {
                    el.append($('<a href="#"></a>').click(this.next.bind(this)).html(this.nextText));
                    el.append($('<a href="#"></a>').click(this.last.bind(this)).html(this.lastText));
                }
            }
            else {
                this.hide();
            }
		},
        next: function() {//下在页
            return this.go(this.currentIndex + 1);
        },
        previous: function() {//上一页
            return this.go(this.currentIndex - 1);

        },
        index: function() {//首页
            return this.go(0);
        },
        last: function() {//末页
            if (this.total != null) {
                return this.go(this.totalCount - 1);
            }
            else {
                return this.go(0);
            }
        },
        go: function(index) {
            if (this.total != null) {
                if (index > this.totalCount - 1) {
                    this.currentIndex = this.totalCount - 1;
                }
                else if (index != 0) {
                    this.currentIndex = index;
                }
                else {
                    this.currentIndex = 0;
                }
            }
            this.load();
            return false;
        },
        load:function(){
        	console.log(this.currentIndex);
        }
	})
	
	return paging;
})())

Kpages.Ui.Message = Kpages.Ui.Message ||((function(){
	var msg = function(){ this.init()}
	msg.inheritance(Ui.Base,{
        object: null,
        select: null,
        isShow: false,
		init:function(){
            msg.element = $('' +
            '<div class="gl_flow" style="display: none;">' +
                '<h3><span class="f_right"><a href="#" onclick="return false;"><img sid="close" src="http://img.horise.com/stocknew/Content/images/market_zxg_06.gif" border="0" /></a></span><span sid="title"></span></h3>' +
                '<dl sid="con" style="text-align: center">' +
                '</dl>' +
                '<ul style="text-align: center">' +
                    '<table width="100%" border="0" cellpadding="0" cellspacing="0">' +
                        '<tr sid="butt">' +
                        '</tr>' +
                    '</table>' +
                '</ul>' +
            '</div>');
            msg.bg = $('<div style="display: none;"></div>');
            msg.bg.css({ 'position': 'absolute', 'z-index': '10000', 'left': '0px', 'top': '0px', 'background-color': '#000', 'width': '100%' });
            this.alpha(msg.bg, 50);
            msg.element.css({ 'position': 'absolute', 'z-index': '10001' });
            $('body').prepend(msg.element);
            $('body').prepend(msg.bg);
            var win = $(window);
            win.bind('resize', this.set);
            win.bind('scroll', this.set);
            this.set();
            this.onUnLoad = new Kpages.Delegate();
            this.onLoad = new Kpages.Delegate();
            msg.element.find('*[sid=close]').click(msg.close);
		},
        set: function() {
            if (msg.isShow) {
                var win = $(window);
                var width = win.width();
                var height = win.height();
                var scrollLeft = win.scrollLeft();
                var scrollTop = win.scrollTop();
                msg.bg.height(height);
                msg.bg.css({ 'top': scrollLeft + 'px', 'left': scrollTop + 'px' });
                var _w = msg.element.width();
                var _h = msg.element.height();
                msg.element.css({ 'left': ((width - _w) / 2 + scrollLeft) + 'px', 'top': ((height - _h) / 2 + scrollTop) + 'px' });
            }
        },
        show: function(title, con, butts, width) {
            msg.isShow = true;
            if (!Kpages.Ui.Message.object && !Kpages.Ui.Message.select) {
                Kpages.Ui.Message.object = $('object:visible');
                Kpages.Ui.Message.select = $('select:visible');
                Kpages.Ui.Message.object.hide();
                Kpages.Ui.Message.select.hide();
            }
            var argu = arguments;
            if (argu.length == 1) {
                con = title;
                title = undefined;
            }
            if (argu.length < 3) {
                butts = { '<input type="image" src="http://img.horise.com/stocknew/Content/images/market_17.png" />': function() { msg.close(); } };
            }
            width = width || 390;
            title = title || '<span><img src="http://img.horise.com/stocknew/Content/images/market_20.png" />系统提示</span>';
            var m = msg;
            var el = m.element;
            this.onLoad.call();
            el.width(width);
            var _title = el.find('*[sid=title]');
            _title.html('');
            _title.append(title);
            var _con = el.find('*[sid=con]');
            _con.html('');
            _con.append(con);
            var tr = el.find('*[sid=butt]');
            tr.find('*').remove();
            var count = 0;
            for (var i in butts) {
                count++;
            }
            var w = (100 / count) + '%'
            for (var i in butts) {
                var td = $('<td style="width: ' + w + ';" align="center" valign="middle"><span>' + i + '</span></td>');
                td.find('span').click(butts[i]);
                tr.append(td);
            }
            m.bg.fadeIn(200);this
            el.fadeIn(200);
            this.set();
        },
        close: function() {
            msg.isShow = false;
            if (Kpages.Ui.msg.object && Kpages.Ui.msg.Select) {
                Kpages.Ui.msg.object.show();
                Kpages.Ui.msg.Select.show();
                Kpages.Ui.msg.object = null;
                Kpages.Ui.msg.Select = null;
            }
            this.onUnLoad.call();
            msg.bg.fadeOut(200);
            msg.element.fadeOut(200);
        },
        alpha: function(e, s) {//设置透明度
            e.css('zoom', 1);
            e.css('filter', 'alpha(opacity=' + s + ')');
            e.css('MozOpacity', s / 100);
            e.css('opacity', s / 100);
        }
	});
	
	return msg;
})())

