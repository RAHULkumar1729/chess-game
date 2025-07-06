const socket = io()
const chess = new Chess()

const boardElement = document.querySelector(".chessboard")

let draggedPiece = null;
let playerRole = null;
let sourceSquare = null;

const RenderBoard=()=>{
    const board = chess.board()
    boardElement.innerHTML = ""

    board.forEach((row,rowindex) => {
        row.forEach((square,squareindex)=>{
            const squareElement = document.createElement('div')
            squareElement.classList.add(
                "square",
                (rowindex + squareindex)%2 === 0 ? "light":"dark"
            )
            squareElement.dataset.row = rowindex
            squareElement.dataset.col = squareindex

            if(square){
                const peiceElement = document.createElement("div")
                peiceElement.classList.add(
                    "piece",
                     square.color === "w" ? "white":"black"
                )
                peiceElement.innerHTML = GetPieceUnicode(square);
                peiceElement.draggable = (playerRole === square.color)

                peiceElement.addEventListener("dragstart",(e)=>{
                    if(peiceElement.draggable){
                       draggedPiece = peiceElement;
                       sourceSquare = {row : rowindex,col:squareindex};
                       e.dataTransfer.setData("text/plain","");
                    }
                })
                peiceElement.addEventListener("dragend",(e)=>{
                    draggedPiece = null
                    sourceSquare = null
                })

                squareElement.append(peiceElement)
            }

            squareElement.addEventListener("dragover",(e)=>{
                e.preventDefault()
            })
            squareElement.addEventListener("drop",(e)=>{
                e.preventDefault()
                if(draggedPiece){
                    let targetSource = {
                        row : parseInt(squareElement.dataset.row),
                        col : parseInt(squareElement.dataset.col)
                    }
                    HandleMove(sourceSquare,targetSource)
                }

            })
            boardElement.appendChild(squareElement);
        })
    });
    if(playerRole === "b"){
        boardElement.classList.add("flipped")
    }
    else{
        boardElement.classList.remove("flipped")
    }

}

const HandleMove =(source,target)=>{
    const move = {
        from: `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to: `${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion : 'q'
    }
    socket.emit("move",move)

}

const GetPieceUnicode=(piece)=>{
    const unicodePeices={
        K: "♔",  // King
        Q: "♕",  // Queen
        R: "♖",  // Rook
        B: "♗",  // Bishop
        N: "♘",  // Knight
        P: "♙",  // Pawn
        k: "♚",  // King
        q: "♛",  // Queen
        r: "♜",  // Rook
        b: "♝",  // Bishop
        n: "♞",  // Knight
        p: "♟"   // Pawn
    }

    return unicodePeices[piece.type] || ""
}

socket.on("playerRole",(role)=>{
    playerRole = role;
    RenderBoard()

})
socket.on("spectatorRole",()=>{
    playerRole = null;
    RenderBoard()
    
})
socket.on("boardState",(fen)=>{
    chess.load(fen)
    RenderBoard()
    
})
socket.on("move",(move)=>{
    chess.move(move)
    RenderBoard()
})



