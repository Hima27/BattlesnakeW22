import { InfoResponse, GameState, MoveResponse, Game } from "./types"

export function info(): InfoResponse {
    console.log("INFO")
    const response: InfoResponse = {
        apiversion: "1",
        author: "",
        color: "#888888",
        head: "default",
        tail: "default"
    }
    return response
}

export function start(gameState: GameState): void {
    console.log(`${gameState.game.id} START`)
}

export function end(gameState: GameState): void {
    console.log(`${gameState.game.id} END\n`)
}

export function move(gameState: GameState): MoveResponse {
    let possibleMoves: { [key: string]: boolean } = {
        up: true,
        down: true,
        left: true,
        right: true
    }

    // Step 0: Don't let your Battlesnake move back on it's own neck
    const myHead = gameState.you.head
    const myNeck = gameState.you.body[1]
    if (myNeck.x < myHead.x) {
        possibleMoves.left = false
    } else if (myNeck.x > myHead.x) {
        possibleMoves.right = false
    } else if (myNeck.y < myHead.y) {
        possibleMoves.down = false
    } else if (myNeck.y > myHead.y) {
        possibleMoves.up = false
    }

    // TODO: Step 1 - Don't hit walls.
    // Use information in gameState to prevent your Battlesnake from moving beyond the boundaries of the board.
    const boardWidth = gameState.board.width
    const boardHeight = gameState.board.height
    if(myHead.x+1 == boardWidth && myHead.y+1 == boardHeight){
      //top right corner - move down
      possibleMoves.up = false
      possibleMoves.right = false
    }
    else if(myHead.x == 0 && myHead.y+1 == boardHeight){
      //top left corner - move down
      possibleMoves.up = false
      possibleMoves.left = false
    }
    else if(myHead.x+1 == boardWidth && myHead.y == 0){
      //bottom right corner - move up
      possibleMoves.down = false
      possibleMoves.right = false
    }
    else if(myHead.x == 0 && myHead.y == 0){
      //bottom left corner - move up
      possibleMoves.down = false
      possibleMoves.left = false
    }
      
    //not corners - direct edges
    else if(myHead.y+1 < boardHeight && myHead.x+1 == boardWidth){
      //colliding into right wall -> move up or down
      //add extra logic for cases for nearest food or avoid other snake
      possibleMoves.left = false
      possibleMoves.right = false
    }
    else if(myHead.y+1 < boardHeight && myHead.x == 0){
      //colliding into left wall -> move up or down
      //add extra logic for cases for nearest food or avoid other snake
      possibleMoves.left = false
      possibleMoves.right = false
    }
    else if(myHead.y+1 == boardHeight && myHead.x+1 < boardWidth){
      //colliding into top wall -> move left or right
      //add extra logic for cases for nearest food or avoid other snake
      possibleMoves.up = false
      possibleMoves.down = false
    }
    else if(myHead.y == 0 && myHead.x+1 < boardWidth){
      //colliding into bottom wall -> move left or right
      //add extra logic for cases for nearest food or avoid other snake
      possibleMoves.up = false
      possibleMoves.down = false
    }

    // TODO: Step 2 - Don't hit yourself.
    // Use information in gameState to prevent your Battlesnake from colliding with itself.
    // const mybody = gameState.you.body

    // TODO: Step 3 - Don't collide with others.
    // Use information in gameState to prevent your Battlesnake from colliding with others.

    // TODO: Step 4 - Find food.
    // Use information in gameState to seek out and find food.

    // Finally, choose a move from the available safe moves.
    // TODO: Step 5 - Select a move to make based on strategy, rather than random.
    const safeMoves = Object.keys(possibleMoves).filter(key => possibleMoves[key])
    const response: MoveResponse = {
        move: safeMoves[Math.floor(Math.random() * safeMoves.length)],
    }

    console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`)
    return response
}
