import { InfoResponse, GameState, MoveResponse, Game, Battlesnake, Coord } from "./types"
import { GridCell } from "./gridCell"

export function info(): InfoResponse {
  console.log("INFO")
  const response: InfoResponse = {
    apiversion: "1",
    author: "",
    color: "#ad0000",
    head: "gamer",
    tail: "coffee"
  }
  return response
}

export function start(gameState: GameState): void {
  console.log(`${gameState.game.id} START`)
}

export function end(gameState: GameState): void {
  console.log(`${gameState.game.id} END\n`)
}


let grid: GridCell[][] = []

export function init(height: number, width: number) {

  for (let y = 0; y < height; y++) {
    let gridRow: GridCell[] = []
    for (let x = 0; x < width; x++) {
      gridRow.push({
        isSnake: false,
        isOurself: false,
        isFood: false,
        isHead: false,
        likelyMove: ""
      })
    }
    grid.push(gridRow)
  }

  console.log(grid)
}


export function move(gameState: GameState): MoveResponse {

  let possibleMoves: { [key: string]: boolean } = {
    up: true,
    down: true,
    left: true,
    right: true
  }



  // Step 0: Don't hit snakes
  const myHead = gameState.you.head
  const myBody = gameState.you.body

  const allSnakes: Battlesnake[] = gameState.board.snakes



  for (const snake of allSnakes) {
    const snakeBody: Coord[] = snake.body

    grid[snake.head.y][snake.head.x].isHead = true

    for (const bodyPart of snakeBody) {

      grid[bodyPart.y][bodyPart.x].isSnake = true
      grid[bodyPart.y][bodyPart.x].isOurself = false
      grid[bodyPart.y][bodyPart.x].isFood = false


      if (bodyPart.x == myHead.x - 1 && bodyPart.y == myHead.y) {
        possibleMoves.left = false
      } else if (bodyPart.x == myHead.x + 1 && bodyPart.y == myHead.y) {
        possibleMoves.right = false
      } else if (bodyPart.y == myHead.y - 1 && bodyPart.x == myHead.x) {
        possibleMoves.down = false
      } else if (bodyPart.y == myHead.y + 1 && bodyPart.x == myHead.x) {
        possibleMoves.up = false
      }
    }
  }

  for (const myBodyPart of myBody) {
    grid[myBodyPart.y][myBodyPart.x].isOurself = true
  }


  // TODO: Step 1 - Don't hit walls.
  const boardWidth = gameState.board.width
  const boardHeight = gameState.board.height



  if (myHead.x + 1 >= boardWidth) {
    possibleMoves.right = false
  }
  if (myHead.x - 1 < 0) {
    possibleMoves.left = false
  }
  if (myHead.y + 1 >= boardHeight) {
    possibleMoves.up = false
  }
  if (myHead.y - 1 < 0) {
    possibleMoves.down = false
  }
  console.log(possibleMoves)



  // if(myHead.x+1 == boardWidth && myHead.y+1 == boardHeight){
  //   //top right corner - move down
  //   possibleMoves.up = false
  //   possibleMoves.right = false
  // }
  // else if(myHead.x == 0 && myHead.y+1 == boardHeight){
  //   //top left corner - move down
  //   possibleMoves.up = false
  //   possibleMoves.left = false
  // }
  // else if(myHead.x+1 == boardWidth && myHead.y == 0){
  //   //bottom right corner - move up
  //   possibleMoves.down = false
  //   possibleMoves.right = false
  // }
  // else if(myHead.x == 0 && myHead.y == 0){
  //   //bottom left corner - move up
  //   possibleMoves.down = false
  //   possibleMoves.left = false
  // }

  // //not corners - direct edges
  // else if(myHead.y+1 < boardHeight && myHead.x+1 == boardWidth){
  //   //colliding into right wall -> move up or down
  //   //add extra logic for cases for nearest food or avoid other snake
  //   possibleMoves.left = false
  //   possibleMoves.right = false
  // }
  // else if(myHead.y+1 < boardHeight && myHead.x == 0){
  //   //colliding into left wall -> move up or down
  //   //add extra logic for cases for nearest food or avoid other snake
  //   possibleMoves.left = false
  //   possibleMoves.right = false
  // }
  // else if(myHead.y+1 == boardHeight && myHead.x+1 < boardWidth){
  //   //colliding into top wall -> move left or right
  //   //add extra logic for cases for nearest food or avoid other snake
  //   possibleMoves.up = false
  //   possibleMoves.down = false
  // }
  // else if(myHead.y == 0 && myHead.x+1 < boardWidth){
  //   //colliding into bottom wall -> move left or right
  //   //add extra logic for cases for nearest food or avoid other snake
  //   possibleMoves.up = false
  //   possibleMoves.down = false
  // }

  // TODO: Step 2 - Don't hit yourself.
  // Use information in gameState to prevent your Battlesnake from colliding with itself.
  const mybody = gameState.you.body
  // mybody.forEach(function (coordinate) {
  //   if(myHead.x-1)
  //   // console.log("location: " + coordinate.x + "," + coordinate.y);
  // });


  // TODO: Step 3 - Don't collide with others.
  // Use information in gameState to prevent your Battlesnake from colliding with others.

  // TODO: Step 4 - Find food.
  // Use information in gameState to seek out and find food.

  // Finally, choose a move from the available safe moves.
  // TODO: Step 5 - Select a move to make based on strategy, rather than random.
  const safeMoves = Object.keys(possibleMoves).filter(key => possibleMoves[key])

  // console.log(safeMoves)
  const response: MoveResponse = {
    move: safeMoves[Math.floor(Math.random() * safeMoves.length)],
  }

  console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`)
  return response
}
