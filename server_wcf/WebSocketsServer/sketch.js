var sketch = (function() {
    "use strict";

    var context;
    var paint;
    var clients = [];
    var connection;
    var selfId;
    var selfColor;

    var onMouseDown = function(e) {
        paint = true;
        setPosition(selfId, { x: e.clientX, y: e.clientY, color: selfColor, action: "down" });
    };

    var onMouseMove = function(e) {
        if (paint) {
            var data = { x: e.clientX, y: e.clientY, color: selfColor, action: "move" };
            drawLine(selfId, data);
            setPosition(selfId, data);
        }
    };

    var onMouseUp = function(e) {
        paint = false;
    };

    var drawLine = function(id, data) {
        context.beginPath();

        if (clients[id]) {
            context.moveTo(clients[id].lastx, clients[id].lasty);
        }

        context.strokeStyle = data.color;
        context.lineTo(data.x, data.y);
        context.stroke();
    };

    var onPaint = function(id, data) {
        if (data.action === "move") {
            drawLine(id, data);
        }
        setPosition(id, data);
    };

    var setPosition = function(id, data) {
        clients[id].lastx = data.x;
        clients[id].lasty = data.y;

        if (id != selfId) return;

        connection.send(window.JSON.stringify({ type: 2, Value: data }));
    };

    var onUpdateClients = function(ids) {
        for (var id in ids) {
            if (!clients[ids[id]]) {
                clients[ids[id]] = { lastx: 0, lasty: 0 };
            }
        }
    };

    var setColor = function(id, color) {
        selfColor = color;
    };

    return {
        init: function() {
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

            var host = "ws://localhost/WebSocketsServer/CanvasService.svc";

            connection = new WebSocket(host);

            connection.onopen = function() {
                selfId = prompt("Your ID?");
                connection.send(window.JSON.stringify({ type: 0, Value: selfId }));
            };

            connection.onerror = function() {
                alert("error");
            };

            connection.onmessage = function(message) {
                var data = window.JSON.parse(message.data);
                if (data.type == 1) {
                    onUpdateClients(data.value);
                }
                if (data.type == 2 && data.username != selfId) {
                    onPaint(data.username, data.value);
                }
            };            
            
            
        },

        setColor: function(color) {
            setColor(selfId, color);
        }
    };
})();

window.onload = function() {
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

};