import { GridCell } from "./gridCell"
import { availableSpace, printGrid, clearGrid, getSquaredDistance, canWinHeadOn, toSimpleGrid, wallHitDirections, populateGrid, snakeHitDirections, createGrid } from "./heuristicUtils"
import { InfoResponse, GameState, MoveResponse, Game, Battlesnake, Coord } from "./types"
import _ from "lodash"
import { AStarFinder } from "astar-typescript";
import { HEIGHT, USE_LOGGER, WIDTH } from "./constants";
import { Direction, generatePositions, miniMax, Position } from "./miniMax";
// import { MiniMaxLogger } from './visualizer/minimaxLogger'

type PossibleMoveTendencies = {
  up: number,
  down: number,
  left: number,
  right: number
}

type Mask = PossibleMoveTendencies



export class Heuristic {

  grid: GridCell[][] = []

  foodWeight: number = 5
  currentFoodWeight: number = this.foodWeight
  spaceWeight: number = 1
  criticalHealth: number = 75
  headOnWeight: number = 10
  goToCenterWeight: number = 1
  randomWeight: number = 1
  miniMaxWeight: number = 10

  constructor() {
    this.grid = createGrid()
  }

  getRandomMask(): Mask {
    return {
      up: Math.round(Math.random()) * this.randomWeight,
      down: Math.round(Math.random()) * this.randomWeight,
      left: Math.round(Math.random()) * this.randomWeight,
      right: Math.round(Math.random()) * this.randomWeight,
    }
  }



  //Soft tendencies to stay near the center
  getToCenterMask(gameState: GameState): Mask {
    const me = gameState.you
    const myHead = me.head

    const center = {
      x: Math.floor(WIDTH / 2),
      y: Math.floor(HEIGHT / 2)
    }

    const tendencies: Mask = {
      up: this.goToCenterWeight * (center.y - myHead.y),
      down: -1 * this.goToCenterWeight * (center.y - myHead.y),
      left: -1 * this.goToCenterWeight * (center.x - myHead.x),
      right: this.goToCenterWeight * (center.x - myHead.x),
    }

    return tendencies



  }





  //Absolute tendencies to escape or win head-ons
  getHeadOnMask(gameState: GameState): Mask {
    const me = gameState.you
    const myHead = me.head



    let topTendency = 0
    let leftTendency = 0
    let rightTendency = 0
    let downTendency = 0


    //condition to determine if we are likely to head on

    // chose to check snakes instead of location first

    const otherSnakes = gameState.board.snakes.slice(1)



    for (const otherSnake of otherSnakes) {
      const otherSnakeHead = otherSnake.head

      if ((otherSnakeHead.x == myHead.x) && (otherSnakeHead.y == myHead.y + 2)) {
        //headOn
        if (canWinHeadOn(me, otherSnake)) {
          //head on this bih
          topTendency = this.headOnWeight
        } else {
          topTendency = -1 * this.headOnWeight
        }
      } else if ((otherSnakeHead.x == myHead.x + 1) && (otherSnakeHead.y == myHead.y + 1)) {
        //headOn
        if (canWinHeadOn(me, otherSnake)) {
          //head on this bih
          topTendency = this.headOnWeight
          rightTendency = this.headOnWeight
        } else {
          topTendency = -1 * this.headOnWeight
          rightTendency = -1 * this.headOnWeight
        }
      } else if ((otherSnakeHead.x == myHead.x + 2) && (otherSnakeHead.y == myHead.y)) {
        //headOn
        if (canWinHeadOn(me, otherSnake)) {
          //head on this bih
          rightTendency = this.headOnWeight
        } else {
          rightTendency = -1 * this.headOnWeight
        }
      } else if ((otherSnakeHead.x == myHead.x + 1) && (otherSnakeHead.y == myHead.y - 1)) {
        //headOn
        if (canWinHeadOn(me, otherSnake)) {
          //head on this bih
          downTendency = this.headOnWeight
          rightTendency = this.headOnWeight
        } else {
          downTendency = -1 * this.headOnWeight
          rightTendency = -1 * this.headOnWeight
        }
      } else if ((otherSnakeHead.x == myHead.x) && (otherSnakeHead.y == myHead.y - 2)) {
        //headOn
        if (canWinHeadOn(me, otherSnake)) {
          //head on this bih
          downTendency = this.headOnWeight
        } else {
          downTendency = -1 * this.headOnWeight
        }
      } else if ((otherSnakeHead.x == myHead.x - 1) && (otherSnakeHead.y == myHead.y - 1)) {
        //headOn
        if (canWinHeadOn(me, otherSnake)) {
          //head on this bih
          leftTendency = this.headOnWeight
          downTendency = this.headOnWeight
        } else {
          leftTendency = -1 * this.headOnWeight
          downTendency = -1 * this.headOnWeight
        }
      } else if ((otherSnakeHead.x == myHead.x - 2) && (otherSnakeHead.y == myHead.y)) {
        //headOn
        if (canWinHeadOn(me, otherSnake)) {
          //head on this bih
          leftTendency = this.headOnWeight
        } else {
          leftTendency = -1 * this.headOnWeight
        }
      } else if ((otherSnakeHead.x == myHead.x - 1) && (otherSnakeHead.y == myHead.y + 1)) {
        //headOn
        if (canWinHeadOn(me, otherSnake)) {
          //head on this bih
          topTendency = this.headOnWeight
          leftTendency = this.headOnWeight
        } else {
          topTendency = -1 * this.headOnWeight
          leftTendency = -1 * this.headOnWeight
        }
      }
    }

    console.log({ up: topTendency, down: downTendency, left: leftTendency, right: rightTendency })

    return { up: topTendency, down: downTendency, left: leftTendency, right: rightTendency }



    //  condition to determine if we are going to win head on

    //    true - do head on

    //    false - go other way







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
      this.currentFoodWeight = this.foodWeight
    } else {
      this.currentFoodWeight = 0
    }


    if (closestFood) {

      let simpleGrid = toSimpleGrid(this.grid)

      simpleGrid[myHead.y][myHead.x] = 0

      let aStarInstance = new AStarFinder({
        grid: {
          matrix: simpleGrid
        },
        includeStartNode: false,
        includeEndNode: true
      })


      // console.log(myHead)
      // console.log(closestFood)
      // for (let y = 0; y < HEIGHT; y++) {
      //   for (let x = 0; x < WIDTH; x++) {
      //     if (y == closestFood.y && x == closestFood.x) {
      //       process.stdout.write('F')
      //     } else {
      //       process.stdout.write(toSimpleGrid(this.grid)[y][x].toString())
      //     }

      //   }
      //   console.log()
      // }

      let path = aStarInstance.findPath({ x: myHead.x, y: myHead.y }, { x: closestFood.x, y: closestFood.y })

      if (!_.isEmpty(path)) {
        let firstStepX = path[0][0]
        let firstStepY = path[0][1]

        topTendency = this.currentFoodWeight * (firstStepY - myHead.y)
        leftTendency = -this.currentFoodWeight * (firstStepX - myHead.x)
        rightTendency = this.currentFoodWeight * (firstStepX - myHead.x)
        downTendency = -this.currentFoodWeight * (firstStepY - myHead.y)
      }
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

    const snakeHitDirs = snakeHitDirections(gameState, gameState.you)
    return {
      up: snakeHitDirs.up ? -1 * Infinity : 0,
      down: snakeHitDirs.down ? -1 * Infinity : 0,
      left: snakeHitDirs.left ? -1 * Infinity : 0,
      right: snakeHitDirs.right ? -1 * Infinity : 0,
    }
  }

  //Absolute tendencies to not hit a wall
  getWallCollisionMask(gameState: GameState): Mask {

    const wallHitDirs = wallHitDirections(gameState, gameState.you)

    return {
      up: wallHitDirs.up ? -1 * Infinity : 0,
      down: wallHitDirs.down ? -1 * Infinity : 0,
      left: wallHitDirs.left ? -1 * Infinity : 0,
      right: wallHitDirs.right ? -1 * Infinity : 0,
    }

  }

  getMiniMaxBestMoveMask(gameState: GameState): Mask {
    const position: Position = generatePositions(gameState, 2, 0, "donno")

    const direction: Direction = miniMax(position, 5, -1 * Infinity, Infinity, 0, gameState.board.snakes.length)[1]

    console.log(position)


    return {
      up: direction == "up" ? this.miniMaxWeight : 0,
      down: direction == "down" ? this.miniMaxWeight : 0,
      left: direction == "left" ? this.miniMaxWeight : 0,
      right: direction == "right" ? this.miniMaxWeight : 0
    }

  }


  move(gameState: GameState) {
    clearGrid(this.grid)



    //make me first in snake list
    const me: Battlesnake = gameState.you
    gameState.board.snakes.sort((snakeA: Battlesnake, snakeB: Battlesnake) => {
      return snakeA.id == me.id ? -1 : snakeB.id == me.id ? 1 : 0;
    })
    //ignore my tail
    if (me.health != 100) {
      gameState.you.body.pop()
      gameState.board.snakes[0].body.pop()
    }


    let possibleMoveTendencies: PossibleMoveTendencies = {
      up: 0,
      down: 0,
      left: 0,
      right: 0
    }

    this.grid = populateGrid(this.grid, gameState)


    let logger = undefined

    // if (USE_LOGGER) {
    //   logger = new MinimaxLogger(gameId, turnNumber);
    //   logger.init();
    // }



    let maskPipeline: Mask[] = [
      this.getSnakeCollisionMask(gameState),
      this.getSnakeAvailableSpaceMask(gameState),
      this.getWallCollisionMask(gameState),
      this.getFoodMask(gameState),
      this.getHeadOnMask(gameState),
      this.getToCenterMask(gameState),
      // this.getMiniMaxBestMoveMask(gameState),
      // this.getRandomMask()
    ]




    // console.log(position)

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