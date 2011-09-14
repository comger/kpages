/**
   
**/
$(function(){
    var canvas = new Weibo.Graphic.Canvas("#canvas");
    
    var cube = new Weibo.Graphic.Cube({
        x:200,
        y:200,
        w:120,
        h:80,
        color:"#00ccbb",
        v:{
            x:30, 
            y:20
        }
    });

    cube.MouseOver.Add(function(){
        console.log("cube over");
    });

    cube.MouseOut.Add(function(){
        console.log("cube out");
    });

    //canvas.Draw(cube); 

    var cylinder = new Weibo.Graphic.Cylinder({
        x:300,
        y:200,
        r:80,
        rate:0.45,
        h:360,
        color:"#0aaccc"
    });

    cylinder.MouseOver.Add(function(){
        console.log("cylinder over");
    });

    cylinder.MouseOut.Add(function(){
        console.log("cylinder out");
    });

    canvas.Draw(cylinder);

    var cylinder2 = new Weibo.Graphic.Cylinder({
        x:500,
        y:200,
        r:80,
        rate:0.45,
        h:360,
        color:"#0aaccc"
    }); 

    cylinder2.MouseOver.Add(function(){
        console.log("cylinder2 over");
    });

    cylinder2.MouseOut.Add(function(){
        console.log("cylinder2 out");
    });

     canvas.Draw(cylinder2);
       
})
