const {rooms} = require('./rooms');
const users=[]

const addUser=({id,username,creator,room})=>{
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    if(!username || !room){
        return {
            error:'Username and room are required'
        }
    }

    const existingUser=users.find((user)=>{
        return user.room===room && user.username===username
    })
    const existingRoom = rooms.find((liveRoom) => {
        return liveRoom.name === room && creator === 'true'
     })
     if (existingRoom) {
        return {
            error: 'That room already exists!'
        }
    }
    if(existingUser){
        return{
            error:'Username already exists !'
        }
    }

    const user={id,username,room}
    users.push(user)
    return {user}
}

const removeUser=(id)=>{
    const index=users.findIndex((user)=>{
        return user.id===id
    })
    if(index!=-1){
        return users.splice(index,1)[0]
    }
}

const getUser=(id)=>{
    return users.find((user)=>{
        return user.id===id
    })
}
const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase()
    return users.filter((user)=>{
        return user.room===room
    })
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    users
}