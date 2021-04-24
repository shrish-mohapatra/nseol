const path = require("path");
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'proto', 'js')));
app.use(express.static(path.join(__dirname, 'proto', 'css')));
app.use(express.static(path.join(__dirname, 'proto')));

function onConnection(socket){
  socket.on('drawing', (data) => {
    socket.broadcast.emit('drawing', data)
  });

  socket.on('clearCanvas', () => socket.broadcast.emit('clearCanvas'));
}

io.on('connection', onConnection);

app.get("/*", (req, res) => {
    const filePath = path.join(__dirname, 'proto', 'index.html');
    res.sendFile(filePath)
})

http.listen(port, () => console.log('listening on port ' + port));