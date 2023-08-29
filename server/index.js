const {Server} = require('socket.io');

const io = new Server(8000, {
    cors:true,
});

//Now to see konsi eail id kis room mein hai
const emailToSocketIdMap = new Map();
//we also need a reverse mapping to extract email from socket id hence - 
const socketidToEmailMap = new Map();


io.on('connection',socket=>{
    console.log(`socket connected`, socket.id);
    socket.on('room:join', data=> {
        const {email, room} = data;
        emailToSocketIdMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);
        try {
            
            io.to(room).emit("user:joined", { email, id: socket.id }); // will notify that a user is joined and will show its email and socket.id
            socket.join(room); // joining user into room
        } catch (error) {
            console.log('notification not working');
        }
        io.to(socket.id).emit('room:join', data); //returning data at that event and pushing user into room
    });
});