/*
 * 颜色处理
 * Author:      llq
 * Date:        2011-09-14
 * */
(function(){
    var _TYPE_RGB = "rgb",
        _TYPE_HSV = "hsv";
        _TYPE_ALL = "all";
    var _Color = window.Color = function(s){
        this.type = _TYPE_RGB;
        this.r = parseInt(s.slice(1,3), 16);
        this.g = parseInt(s.slice(3,5), 16);
        this.b = parseInt(s.slice(5,7), 16);
    }
    _Color.prototype = {
        toString : function(){
            if(!this.type)
                return "";
            if(this.type == _TYPE_HSV)
                this._GetRGB();
            if(!this._string)
                this._string = ["#",("0" + this.r.toString(16)).slice(-2), ("0" + this.g.toString(16)).slice(-2), ("0" + this.b.toString(16)).slice(-2)].join('');
            return this._string;
        },
        _GetRGB : function(){
            if(this.s == 0)
                this.r = this.g = this.b = this.v;
            else{
                var i = parseInt(this.h/60);
                var f = this.h/60 - i;
                var p = parseInt(this.v*(1 - this.s)),
                    q = parseInt(this.v*(1 - f * this.s)),
                    t = parseInt(this.v*(1 - (1 - f)* this.s));
                if(i == 0){
                    this.r = this.v;
                    this.g = t;
                    this.b = p;
                }else if(i == 1){
                    this.r = q;
                    this.g = this.v;
                    this.b = p;
                }else if(i == 2){
                    this.r = p;
                    this.g = this.v;
                    this.b = t;
                }else if(i == 3){
                    this.r = p;
                    this.g = q;
                    this.b = this.v;
                }else if(i == 4){
                    this.r = t;
                    this.g = p;
                    this.b = this.v;
                }else{
                    this.r = this.v;
                    this.g = p;
                    this.b = q;
                }
            }
            this.type = _TYPE_ALL;
        },
        _GetHSV : function(){
            var max = Math.max(this.r, this.g, this.b);
            var min = Math.min(this.r, this.g, this.b);
            var h;
            if(this.r == max) h = (this.g - this.b) / (max - min);
            if(this.g == max) h = 2 + (this.b - this.r) / (max - min);
            if(this.b == max) h = 4 + (this.r - this.g) / (max - min);
            h = h * 60;
            if ( h < 0) h += 360;
            this.h = h;
            this.s =( max - min) / max;
            this.v = max;
        },
        changeS : function(x){
            if(this.type == _TYPE_RGB)
                this._GetHSV();
            this.s += x;
            this.s = this.s > 1?1:(this.s < 0?0:this.s);
            this._GetRGB();
        },
        changeV : function(x){
            if(this.type == _TYPE_RGB)
                this._GetHSV();
            this.v += x;
            this.v = this.v > 255?255:(this.v < 0?0:this.v);
            this._GetRGB();
        }
    }
})()
