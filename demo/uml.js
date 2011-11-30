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
	});
		
	canvas.DragEnable(gacls);
	canvas.Draw(gacls)
	
	var gacls2 = new Kpages.Graphic.GaClass({
			x:400,
			y:100,
			data:{
				cls:"ClassV",
				propertys:["a:int","b:string","c:float"],
				methods:[
					{
						name:"toJson",
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
	canvas.DragEnable(gacls2);
	canvas.Draw(gacls2)


})
