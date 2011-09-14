/**
   
**/
$(function(){
    var canvas = new Weibo.Graphic.Canvas("#canvas");
    
    var cube = new Weibo.Graphic.Cube({
        x:200,
        y:200,
        w:120,
        h:180,
        color:"#d1e8f9",
        v:{
            x:50, 
            y:20
        }
    });

    cube.MouseOver.Add(function(){
        console.log("cube over");
    });

    cube.MouseOut.Add(function(){
        console.log("cube out");
    });

    canvas.Draw(cube);    
})
