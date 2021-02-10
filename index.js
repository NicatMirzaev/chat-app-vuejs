const express = require('express')
const path = require('path')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000
const users = {};
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile('index.html')
})

io.on('connection', socket => {
   console.log('A user connected');
   socket.on('disconnect', function () {
      console.log('A user disconnected');
   });

   socket.on("join-room", (data) => {
     const { username, room } = data;
     if(username === undefined || room === undefined) {
       socket.emit("join-room", {error: "Please enter name and room name."})
     }
     else {
       if(users[username] === undefined) {
         users[username] = {room: room, typing: false}
         socket.emit("join-room", {error: ""})
         console.log(`User ${username} has joined to room ${room}`)
       }
       else {
         socket.emit("join-room", {error: "This username already taken, please choose another name."})
       }
     }
   })
});

http.listen(port, () => {
  console.log(`Server listening at port ${port}`)
})
