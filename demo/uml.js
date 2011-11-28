/**
   uml Demo
**/
$(function(){
    var canvas = new Kpages.Graphic.Canvas("#canvas");
    
	   var gacls = new Kpages.Graphic.GaClass({
			x:100,
			y:100,
			data:{
				cls:"ClassA",
				propertys:["a:int","b:string","c:float"],
				methods:[
					{
						name:"saveToDb",
						params:["a:int","b:string"],
						reutrntype:"string"
					},
					{
						name:"parseToInt",
						params:["b:string"],
						reutrntype:"int"
					},
				]
			}
		})
		
	canvas.Draw(gacls)


})
