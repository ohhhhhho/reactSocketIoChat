import { Server } from "socket.io";
import express from "express";
import { createServer } from "node:http";
import viteExpress from 'vite-express'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer,{
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"], // 로컬 개발용
        methods: ["GET", "POST"] ,
        credentials: true
    }
});
//연결이 됐을때
io.on('connection', (client) => {
    console.log("사용자가 들어왔습니다")
    console.log(client.handshake.query.username)
    const connectedUser = client.handshake.query.username

    //서버에서 클라이언트한테 보낼 메세지
    client.broadcast.emit("new message",{username:"관리자",message:`${connectedUser}님이 들어왔습니다 `})

    //클라이언트에서 보낸 메세지 받기
    client.on('new message', (msg) => {
        //연결이 되어 있을때 메세지 보내기
        io.emit('new message',{username:msg.username,message:msg.message})
    }) 
    //연결이 끊어졌을때   
    client.on('disconnect', () => {
        //연결이 끊어졌을때 클라이언트에 메세지 보내기
        io.emit("new message",{username:"관리자",message:`${connectedUser}님이 나갔습니다 `})
    })
})

// 프로덕션 환경에서 정적 파일 제공
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist/index.html'));
    });
}

// 개발 환경에서만 vite-express 사용
if (process.env.NODE_ENV !== 'production') {
    import('vite-express').then(({ default: viteExpress }) => {
        viteExpress.bind(app, httpServer);
    });
}
httpServer.listen(3000, () => {
    console.log('서버에서 듣고 있음')
})

app.get("/message",(_,res) => res.send("Hello from express"))

viteExpress.bind(app,httpServer)