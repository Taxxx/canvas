var sketch = (function () {
    "use strict";
    
    var context;
    var paint;
    var clients = [];
    var socket;
    var selfID
    var selfColor;
    
    var onMouseDown = function (e) {
        paint = true;
        setPosition(selfID, {x: e.clientX, y: e.clientY, color: selfColor, action: "down" });
    };
    
    var onMouseMove = function (e) {
      if (paint) {
        var data = {x: e.clientX, y: e.clientY, color: selfColor, action: "move" };
        drawLine(selfID, data);
        setPosition (selfID, data);
      }
    };
    
    var onMouseUp = function (e) {
        paint = false;
    };
           
    var drawLine = function (id, data) {
      context.beginPath();
      
      if (clients[id]) {
        context.moveTo(clients[id].lastx, clients[id].lasty);
      }
      
      context.strokeStyle = data.color;
      context.lineTo(data.x, data.y);
      context.stroke();  
    };
    
    var onPaint = function (id, data) {
      if (data.action === "move") {
        drawLine(id, data);
      }
      setPosition (id, data);
    };
    
    var setPosition = function (id, data) {
      clients[id].lastx=data.x;
      clients[id].lasty=data.y;
      
      if (id != selfID) return; 
      
      socket.emit("draw", data);
    };
            
    var onUpdateClients = function(ids) {  
      for (var id in ids)
      {
        if (!clients[id]) {
          clients[id] = { lastx: 0, lasty: 0 };
        }
      }
    };
    
    var setColor = function (id, color) {
      selfColor = color;
    };

    return {
        init: function () {
            var canvas = document.getElementsByTagName('canvas')[0];
            context = canvas.getContext('2d');
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
                        
            selfColor = "green";
            context.lineJoin = "round";
            context.lineCap = "round";
            context.lineWidth = 15;
           
            canvas.addEventListener('mousemove', onMouseMove, false); 
            canvas.addEventListener('mousedown', onMouseDown, false);
            canvas.addEventListener('mouseup', onMouseUp, false);
                      
            socket = io.connect('http://127.0.0.1:1380');
            
            socket.on('connect', function () {
              selfID = prompt("Your ID?");
              socket.emit('addclient', selfID);
                        
              socket.on('updateclients', onUpdateClients);             
              socket.on('draw', onPaint);
            });
            
        },
        
        setColor: function (color) {
            setColor(selfID, color);
        }
    }
})();

window.onload=function () {
/* document.getElementById('butRed').addEventListener('click', function () {
  sketch.setColor('red');    
});
document.getElementById('butBlue').addEventListener('click', function () {
  sketch.setColor('blue');    
});
document.getElementById('butGreen').addEventListener('click', function () {
  sketch.setColor('green');    
});*/
sketch.init();

}