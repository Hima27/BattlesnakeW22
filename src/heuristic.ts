import { GridCell } from "./gridCell"
import { availableSpace, printGrid, clearGrid } from "./heuristicUtils"
import { InfoResponse, GameState, MoveResponse, Game, Battlesnake, Coord } from "./types"

type PossibleMoveTendencies = {
  up: number,
  down: number,
  left: number,
  right: number
}

type Mask = PossibleMoveTendencies



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

    const THRESHOLD = 20

    // const topAvailableSpaces = availableSpace(this.grid,)

    const myHead = gameState.you.head

    const topAvailableSpaces = availableSpace(this.grid, { x: myHead.x, y: myHead.y + 1 })
    const bottomAvailableSpaces = availableSpace(this.grid, { x: myHead.x, y: myHead.y - 1 })
    const leftAvailableSpaces = availableSpace(this.grid, { x: myHead.x - 1, y: myHead.y })
    const rightAvailableSpaces = availableSpace(this.grid, { x: myHead.x + 1, y: myHead.y })

    printGrid(this.grid)
    console.log({ up: topAvailableSpaces, down: bottomAvailableSpaces, left: leftAvailableSpaces, right: rightAvailableSpaces })

    return { up: topAvailableSpaces, down: bottomAvailableSpaces, left: leftAvailableSpaces, right: rightAvailableSpaces }


  }

  getSnakeCollisionMask(gameState: GameState): Mask {

    let mask: Mask = {
      up: 0,
      down: 0,
      left: 0,
      right: 0
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
          mask.left = -1 * Infinity
        } else if (bodyPart.x == myHead.x + 1 && bodyPart.y == myHead.y) {
          mask.right = -1 * Infinity
        } else if (bodyPart.y == myHead.y - 1 && bodyPart.x == myHead.x) {
          mask.down = -1 * Infinity
        } else if (bodyPart.y == myHead.y + 1 && bodyPart.x == myHead.x) {
          mask.up = -1 * Infinity
        }
      }
    }

    for (const myBodyPart of myBody) {
      this.grid[myBodyPart.y][myBodyPart.x].isOurself = true
    }

    return mask
  }

  getWallCollisionMask(gameState: GameState): Mask {
    let mask: Mask = {
      up: 0,
      down: 0,
      left: 0,
      right: 0
    }
    const boardWidth = gameState.board.width
    const boardHeight = gameState.board.height
    const myHead = gameState.you.head


    if (myHead.x + 1 >= boardWidth) {
      mask.right = -1 * Infinity
    }
    if (myHead.x - 1 < 0) {
      mask.left = -1 * Infinity
    }
    if (myHead.y + 1 >= boardHeight) {
      mask.up = -1 * Infinity
    }
    if (myHead.y - 1 < 0) {
      mask.down = -1 * Infinity
    }

    return mask

  }


  move(gameState: GameState) {
    clearGrid(this.grid)


    let possibleMoveTendencies: PossibleMoveTendencies = {
      up: 0,
      down: 0,
      left: 0,
      right: 0
    }

    let maskPipeline: Mask[] = [this.getSnakeCollisionMask(gameState), this.getSnakeCollisonMask2(gameState), this.getWallCollisionMask(gameState)]


    console.log(maskPipeline)


    maskPipeline.forEach((mask: Mask) => {
      possibleMoveTendencies.up += mask.up
      possibleMoveTendencies.down += mask.down
      possibleMoveTendencies.left += mask.left
      possibleMoveTendencies.right += mask.right
    })


    console.log(possibleMoveTendencies)


    // TODO: Step 4 - Find food.
    // Use information in gameState to seek out and find food.

    // Finally, choose a move from the available safe moves.
    // TODO: Step 5 - Select a move to make based on strategy, rather than random.

    let maxTendency = -1 * Infinity
    Object.entries(possibleMoveTendencies).forEach(([move, tendency]) => {
      if (tendency > maxTendency) {
        maxTendency = tendency
      }
    })

    let bestMoves: string[] = []

    Object.entries(possibleMoveTendencies).forEach(([move, tendency]) => {
      if (tendency == maxTendency) {
        bestMoves.push(move)
      }
    })

    const response: MoveResponse = {
      move: bestMoves[Math.floor(Math.random() * bestMoves.length)]
    }

    return response
  }


}