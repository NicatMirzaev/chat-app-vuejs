const express = require('express')
const path = require('path')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000
let users = [];
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile('index.html')
})

io.on('connection', socket => {
   console.log('A user connected');
   socket.on("join-room", (data) => {
     const { username, room } = data;
     if(username === undefined || room === undefined) {
       socket.emit("join-room", {error: "Please enter name and room name."})
     }
     else {
       const found = users.findIndex(i => i[username] !== undefined);
       if(found == -1) {
         const user = {
           [username]: {room: room, typing: false, id: socket.id}
         }
         users.push(user);
         io.to(room).emit('user-joined', user)
         socket.join(room);
         socket.emit("join-room", {error: "", users: users.filter(user => user[Object.keys(user)[0]].room === room)})
         console.log(`User ${username} has joined to room ${room}`)
       }
       else {
         socket.emit("join-room", {error: "This username already taken, please choose another name."})
       }
     }
   })
   socket.on("chat-message", data => {
     io.to(data.room).emit("chat-message", {username: data.username, message: data.message})
   })
   socket.on("leave-room", username => {
     const user = users.find(user => Object.keys(user)[0] === username)
     if(user !== undefined) {
       io.to(user[Object.keys(user)[0]].room).emit('user-left', user)
       users = users.filter(i => i !== user);
     }
   })
   socket.on("chat-start-typing", username => {
     const user = users.find(user => Object.keys(user)[0] === username)
     if(user !== undefined) {
       const username = Object.keys(user)[0]
       user[username].typing = true
       io.to(user[username].room).emit('user-update', user)
     }
   })
   socket.on("chat-end-typing", username => {
     const user = users.find(user => Object.keys(user)[0] === username)
     if(user !== undefined) {
       const username = Object.keys(user)[0]
       user[username].typing = false
       io.to(user[username].room).emit('user-update', user)
     }
   })
   socket.on("disconnect", () => {
     const user = users.find(user => user[Object.keys(user)[0]].id === socket.id)
     if(user !== undefined) {
       io.to(user[Object.keys(user)[0]].room).emit('user-left', user)
       users = users.filter(i => i !== user);
     }
     console.log('A user disconnected');
   })
});

http.listen(port, () => {
  console.log(`Server listening at port ${port}`)
})
