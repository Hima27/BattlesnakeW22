import { GridCell } from "./gridCell"
import { availableSpace } from "./heuristicUtils"
import { InfoResponse, GameState, MoveResponse, Game, Battlesnake, Coord } from "./types"

type PossibleMoves = {
  up: boolean,
  down: boolean,
  left: boolean,
  right: boolean
}

type Mask = PossibleMoves



export class Heuristic {

  grid: GridCell[][] = []

  constructor(width: number, height: number) {
    for (let y = 0; y < height; y++) {
      let gridRow: GridCell[] = []
      for (let x = 0; x < width; x++) {
        gridRow.push({
          isSnake: false,
          isOurself: false,
          isFood: false,
          isHead: false,
          likelyMove: "",
          x: x,
          y: y
        })
      }
      this.grid.push(gridRow)
    }
  }


  getSnakeCollisonMask2(gameState: GameState): Mask {

    const THRESHOLD = 5

    let possibleMoves: PossibleMoves = {
      up: true,
      down: true,
      left: true,
      right: true
    }

    // const topAvailableSpaces = availableSpace(this.grid,)

    const myHead = gameState.you.head

    const topAvailableSpaces = availableSpace(this.grid, { x: myHead.x, y: myHead.y + 1 })
    console.log(this.grid)
    const bottomAvailableSpaces = availableSpace(this.grid, { x: myHead.x, y: myHead.y - 1 })
    const leftAvailableSpaces = availableSpace(this.grid, { x: myHead.x - 1, y: myHead.y })
    const rightAvailableSpaces = availableSpace(this.grid, { x: myHead.x + 1, y: myHead.y })

    console.log({ up: topAvailableSpaces, down: bottomAvailableSpaces, left: leftAvailableSpaces, right: rightAvailableSpaces })

    return { up: topAvailableSpaces > THRESHOLD, down: bottomAvailableSpaces > THRESHOLD, left: leftAvailableSpaces > THRESHOLD, right: rightAvailableSpaces > THRESHOLD }


  }

  getSnakeCollisionMask(gameState: GameState): Mask {

    let possibleMoves: PossibleMoves = {
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

      this.grid[snake.head.y][snake.head.x].isHead = true

      for (const bodyPart of snakeBody) {

        this.grid[bodyPart.y][bodyPart.x].isSnake = true
        this.grid[bodyPart.y][bodyPart.x].isOurself = false
        this.grid[bodyPart.y][bodyPart.x].isFood = false


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
      this.grid[myBodyPart.y][myBodyPart.x].isOurself = true
    }

    return possibleMoves
  }

  getWallCollisionMask(gameState: GameState): Mask {
    let possibleMoves: Mask = {
      up: true,
      down: true,
      left: true,
      right: true
    }
    const boardWidth = gameState.board.width
    const boardHeight = gameState.board.height
    const myHead = gameState.you.head


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

    return possibleMoves

  }


  move(gameState: GameState) {
    let possibleMoves: PossibleMoves = {
      up: true,
      down: true,
      left: true,
      right: true
    }

    let maskPipeline: Mask[] = [this.getSnakeCollisionMask(gameState), this.getSnakeCollisonMask2(gameState), this.getWallCollisionMask(gameState)]


    console.log(maskPipeline)


    maskPipeline.forEach((mask: Mask) => {
      possibleMoves.up = mask.up && possibleMoves.up
      possibleMoves.down = mask.down && possibleMoves.down
      possibleMoves.left = mask.left && possibleMoves.left
      possibleMoves.right = mask.right && possibleMoves.right
    })


    console.log(possibleMoves)


    // TODO: Step 4 - Find food.
    // Use information in gameState to seek out and find food.

    // Finally, choose a move from the available safe moves.
    // TODO: Step 5 - Select a move to make based on strategy, rather than random.
    const safeMoves = Object.entries(possibleMoves).filter((entry) => {
      return entry[1]
    }).map((entry) => {
      return entry[0]
    })


    const response: MoveResponse = {
      move: safeMoves[Math.floor(Math.random() * safeMoves.length)],
    }

    return response
  }


}