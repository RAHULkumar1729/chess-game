const express = require('express')
const app = express()
const socket = require('socket.io')
const http = require('http')
const path = require('path')
const { Chess } = require('chess.js')

const server = http.createServer(app)
const io = socket(server)

app.set('view engine','ejs')
app.use(express.json())
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({extended:true}))

app.get('/',(req,res)=>{
    res.render('index')
})
let chess = new Chess();
let players = {}
let currentPlayer = "w"


io.on("connection",(client)=>{
    console.log('connected')
    
    if(!players.white){
        players.white = client.id;
        client.emit("playerRole","w")
    }
    else if(!players.black){
        players.black = client.id;
        client.emit("playerRole","b")
    }
    else{
        client.emit(spectatorRole)
    }

    client.on("disconnect",()=>{
        if(client.id === players.black){
            delete players.black
        }
        else if(client.id === players.white){
            delete players.white
        }
    })
    client.on("move",(move)=>{
        try{
            if(chess.turn()=== "w" && client.id !== players.white) return
            if(chess.turn() === "b" && client.id !== players.black) return

            const result = chess.move(move);

            if(result){
                currentPlayer = chess.turn()
                io.emit("move",move)
                io.emit("boardState",chess.fen());
            }
            else{
                console.log("Invalid move",move)
                client.emit("invalidMove",move)
            }
        }catch(err){
            console.error(err)
            client.emit("Invalid move:",move)
        }
    })
})

server.listen(3000,()=>{
    console.log('server started at localhost:3000')
})