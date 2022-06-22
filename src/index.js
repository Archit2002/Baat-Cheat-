const path=require('path')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage}=require('./utils/messages.js')
const {generateLocationMessage}=require('./utils/messages.js')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users.js')
const { addRoom, recountRoom, generateRooms } = require('./utils/rooms.js')

const app=express()
const server=http.createServer(app)
const io =socketio(server)
const port=process.env.PORT || 3000
const publicDirectoryPath=path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
    console.log('web socket connection')
    io.emit('currentRooms', generateRooms());

    socket.on('join',({username,creator,room},callback)=>{
       const {error,user}= addUser({id:socket.id,username,creator,room})
       if(error){
        return callback(error)
       }
        socket.join(user.room)

        socket.emit('message',generateMessage('Admin','Welcome :))) '))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin','Knock Knock '+user.username+' slided in!'))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        io.emit('currentRooms', addRoom( { room } ));

        callback()
    })

    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id)
        const filter=new Filter()
        if(filter.isProfane(message)){
            return callback('Use of bad words not allowed !')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
        
    })
    socket.on('sendLocation',(position,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,'https://google.com/maps?q='+position.latitude+','+position.longitude))
        callback()
    })
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.emit('currentRooms', recountRoom(user.room));
            io.to(user.room).emit('message',generateMessage('Admin', user.username +' got bored and has left ! '))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }

        
    })
})
server.listen(port,()=>{
    console.log('Server is on port '+port)
})