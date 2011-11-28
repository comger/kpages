/**
   3d Demo
**/
$(function(){
    var canvas = new Kpages.Graphic.Canvas("#canvas");
    
    var cube = new Kpages.Graphic.Cube({
        x:100,
        y:200,
        w:120,
        h:180,
        color:"#d1e8f9",
        v:{
            x:50, 
            y:20
        }
    });
   
    cube.setTips("ha ha ha ha ha ");

    cube.click(function(){
    	cube.Opts.y = 300;
        cube.Opts.w = 150;
        cube.Opts.h = 200;
    	canvas.AutoDraw();
    });
	
    canvas.DragEnable(cube);
	
    canvas.Draw(cube); 
    

    var cylinder = new Kpages.Graphic.Cylinder({
        x:600,
        y:200,
        r:80,
        rate:0.45,
        h:180,
        color:"#d1e8f9",
        alt:"cylinder"
    });

    cylinder.setTips("cylinder");
    canvas.DragEnable(cylinder);
    canvas.Draw(cylinder);

    var cylinder2 = new Kpages.Graphic.Cylinder({
        x:400,
        y:200,
        r:80,
        rate:0.45,
        h:180,
        color:"#0aaccc",
        alt:"cylinder2"
    }); 


    cylinder2.setTips("cylinder2");
    canvas.DragEnable(cylinder2);
    canvas.Draw(cylinder2);

    $("#bnadd").click(function(){
        var cld = new Kpages.Graphic.Cylinder({
            x:600+Math.random()*100,
            y:300+Math.random()*100,
            r:80+Math.random()*10,
            rate:Math.random(),
            h:180+Math.random()*100,
            color:"#d1e8f9",
            alt:"cylinder"
        });
        
        canvas.DragEnable(cld);
        canvas.Draw(cld);
    });
    
    $("#bnsaveImage").click(function(){
    	var imgdata = canvas.SaveToImage();
    	console.log(imgdata);
    	var img = $("<img>")
    	img.attr("src",imgdata);
    	$("body").append(img)
    });


})
