import { GridCell } from "./gridCell"
import { availableSpace, printGrid, clearGrid, getSquaredDistance } from "./heuristicUtils"
import { InfoResponse, GameState, MoveResponse, Game, Battlesnake, Coord } from "./types"
import _ from "lodash"

type PossibleMoveTendencies = {
  up: number,
  down: number,
  left: number,
  right: number
}

type Mask = PossibleMoveTendencies



export class Heuristic {

  grid: GridCell[][] = []

  foodWeight: number = 1
  spaceWeight: number = 1
  criticalHealth: number = 50

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


  //Adjustable soft tendencies to get food
  getFoodMask(gameState: GameState): Mask {

    const myHead = gameState.you.head

    const foods = gameState.board.food

    const closestFood = _.minBy(foods, (food) => { return getSquaredDistance(food, myHead) })

    let topTendency = 0
    let leftTendency = 0
    let rightTendency = 0
    let downTendency = 0

    if (gameState.you.health < this.criticalHealth) {
      this.foodWeight = 1
    } else {
      this.foodWeight = -1
    }

    if (closestFood) {
      topTendency = this.foodWeight * (closestFood.y - myHead.y)
      leftTendency = -this.foodWeight * (closestFood.x - myHead.x)
      rightTendency = this.foodWeight * (closestFood.x - myHead.x)
      downTendency = -this.foodWeight * (closestFood.y - myHead.y)
    }


    return { up: topTendency, down: downTendency, left: leftTendency, right: rightTendency }


  }


  //Adjustable soft tendencies to not get suffocated in future moves
  getSnakeAvailableSpaceMask(gameState: GameState): Mask {

    const myHead = gameState.you.head

    const topAvailableSpaces = availableSpace(this.grid, { x: myHead.x, y: myHead.y + 1 })
    const bottomAvailableSpaces = availableSpace(this.grid, { x: myHead.x, y: myHead.y - 1 })
    const leftAvailableSpaces = availableSpace(this.grid, { x: myHead.x - 1, y: myHead.y })
    const rightAvailableSpaces = availableSpace(this.grid, { x: myHead.x + 1, y: myHead.y })
    return { up: this.spaceWeight * topAvailableSpaces, down: this.spaceWeight * bottomAvailableSpaces, left: this.spaceWeight * leftAvailableSpaces, right: this.spaceWeight * rightAvailableSpaces }

  }

  //Absolute tendencies to not hit snakes
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

  //Absolute tendencies to not hit a wall
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

    let maskPipeline: Mask[] = [this.getSnakeCollisionMask(gameState), this.getSnakeAvailableSpaceMask(gameState), this.getWallCollisionMask(gameState), this.getFoodMask(gameState)]


    console.log(maskPipeline)


    maskPipeline.forEach((mask: Mask) => {
      possibleMoveTendencies.up += mask.up
      possibleMoveTendencies.down += mask.down
      possibleMoveTendencies.left += mask.left
      possibleMoveTendencies.right += mask.right
    })


    console.log(possibleMoveTendencies)


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