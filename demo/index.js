/*

   Author: llq<llq17501@gmail.com>
   */
$(function(){
    var canvas = new Weibo.Graphic.Canvas("#canvas");

    for(var i=0;i<50;i++){
        _l1 = new Weibo.Graphic.Line({
            x:0,
            y:i*10,
            endx:500,
            endy:i*10,
            styles:{
                strokeStyle:"#ccc",
                lineWidth:0.5
            }
        });
        canvas.Draw(_l1);

        _l2 = new Weibo.Graphic.Line({
            x:i*10,
            y:0,
            endx:i*10,
            endy:500,
            styles:{
                strokeStyle:"#ccc",
                lineWidth:0.5
            }
        });
        canvas.Draw(_l2);
        
    }


    var rect1 = new Weibo.Graphic.Rect({
            x:100,
            y:120,
            w:100,
            h:130,
            styles:{
                fillStyle:'red',
                lineWidth:4
            }
        });

    
    rect1.MouseOver.Add(function(e){
        console.log("over1");
    })

    rect1.MouseOut.Add(function(e){
        console.log("out1");
    })

    canvas.Draw(rect1);

    var rect2 = new Weibo.Graphic.Rect({
            x:380,
            y:110,
            w:100,
            h:130
        });

    rect2.MouseOver.Add(function(e){
         console.log("over2");
    })

    rect2.MouseOut.Add(function(e){
        console.log("out2");
    })

    canvas.Draw(rect2);
    
    var line1 = new Weibo.Graphic.Line({
        x:0,
        y:0,
        endx:500,
        endy:0
    });

    canvas.Draw(line1);
    var line2 = new Weibo.Graphic.Line({
        x:0,
        y:0,
        endx:000,
        endy:500
    });
    
    canvas.Draw(line2);

    var arc = new Weibo.Graphic.Arc({
        x:500,
        y:250,
        r:50,
        w:0
    });

    arc.MouseOver.Add(function(e){
         console.log("arcover");
    });

    arc.MouseOut.Add(function(e){
         console.log("arcout");
    })


    var arc2 = new Weibo.Graphic.Arc({
        x:500,
        y:500,
        r:50,
        w:0
    });

    arc2.MouseOver.Add(function(e){
         console.log("arc2over");
    });

    arc2.MouseOut.Add(function(e){
         console.log("arc2out");
    })

    canvas.Draw(arc);
    canvas.Draw(arc2);

    var ps = [{x:400,y:400},{x:400,y:600},{x:300,y:500}];
    var tri = new Weibo.Graphic.Fences({
        points:ps
    });


    tri.MouseOver.Add(function(e){
         var m ={ x:e.clientX, y:e.clientY};
         console.log(m);
         console.log("triover");
    });

    tri.MouseOut.Add(function(e){
         console.log("triout");
    })

    var ps2 = [{x:400,y:400},{x:400,y:600},{x:500,y:500}];
    var tri2 = new Weibo.Graphic.Fences({
        points:ps2
    });


    tri2.MouseOver.Add(function(e){
         console.log("tri2over");
    });

    tri2.MouseOut.Add(function(e){
         console.log("tri2out");
    })


    var ps3 = [{x:200,y:200},{x:300,y:200},{x:250,y:250}];
    var tri3 = new Weibo.Graphic.Fences({
        points:ps3
    });


    tri3.MouseOver.Add(function(e){
         console.log("tri3over");
    });

    tri3.MouseOut.Add(function(e){
         console.log("tri3out");
    })

    canvas.Draw(tri);    
    canvas.Draw(tri2); 
    canvas.Draw(tri3); 


    var text1 =new Weibo.Graphic.Text({
        x:500,
        y:100,
        text:"我爱北京天安门",
        font:'bold 30px sans-serif',
        baseline:'top',
        textAlign:'left'
    })

    canvas.Draw(text1);
    
})
