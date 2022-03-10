import _ from "lodash";
import { GridCell } from "./gridCell";
import { availableSpace, createGrid, populateGrid, snakeHitDirections, wallHitDirections } from "./heuristicUtils";
import { Battlesnake, Coord, Game, GameState } from "./types";


export type Direction = "up" | "down" | "left" | "right" | "donno"

export type Position = {
  gameState: GameState,
  children: Position[]
  player: number // 0 is us
  iWentDirection: Direction
}





function amIDead(gameState: GameState): boolean {
  return !gameState.board.snakes.find((battleSnake: Battlesnake) => {
    return battleSnake.id == gameState.you.id
  })
}

function iWon(gameState: GameState): boolean {
  return gameState.board.snakes.length == 1 && gameState.board.snakes[0].id == gameState.you.id
}

function isGameOver(gameState: GameState): boolean {
  return amIDead(gameState) || iWon(gameState)
}


function static_eval(gameState: GameState): number {
  let grid: GridCell[][] = createGrid()

  grid = populateGrid(grid, gameState)

  if (amIDead(gameState)) {
    return -1 * Infinity
  }

  if (iWon(gameState)) {
    return Infinity
  }

  return availableSpace(grid, gameState.you.head)
}

function getPossibleMoves(gameState: GameState, snake: Battlesnake) {

  const snakeHitDirs = snakeHitDirections(gameState, snake)
  const wallHitDirs = wallHitDirections(gameState, snake)

  return {
    up: !(snakeHitDirs.up || wallHitDirs.up),
    down: !(snakeHitDirs.down || wallHitDirs.down),
    left: !(snakeHitDirs.left || wallHitDirs.left),
    right: !(snakeHitDirs.right || wallHitDirs.right),
  }

}



//ASSUMES player 0 in gameState is us, need to enforce that
export function generatePositions(gameState: GameState, depth: number, player: number, direction: Direction): Position {

  if (depth == 0) {
    return { gameState: gameState, children: [], player: player, iWentDirection: direction }
  }

  let children: Position[] = []

  let players = gameState.board.snakes

  let currPlayer = gameState.board.snakes[player]


  const possibleMoves = getPossibleMoves(gameState, currPlayer)



  if (possibleMoves.up) {
    let newGameState = _.cloneDeep(gameState)
    let oldHead = newGameState.board.snakes[player].head
    let newHead: Coord = { x: oldHead.x, y: oldHead.y + 1 }
    //TODO Add lookahead for eating food
    newGameState.board.snakes[player].body.pop()
    newGameState.board.snakes[player].body.unshift(newHead)
    newGameState.board.snakes[player].head = newHead

    if (player == 0) {
      newGameState.you.body.pop()
      newGameState.you.body.unshift(newHead)
      newGameState.you.head = newHead
    }

    children.push(generatePositions(newGameState, player == players.length - 1 ? depth - 1 : depth, (player + 1) % players.length, "up"))
  }

  if (possibleMoves.down) {
    let newGameState = _.cloneDeep(gameState)
    let oldHead = newGameState.board.snakes[player].head
    let newHead: Coord = { x: oldHead.x, y: oldHead.y - 1 }
    //TODO Add lookahead for eating food
    newGameState.board.snakes[player].body.pop()
    newGameState.board.snakes[player].body.unshift(newHead)
    newGameState.board.snakes[player].head = newHead

    if (player == 0) {
      newGameState.you.body.pop()
      newGameState.you.body.unshift(newHead)
      newGameState.you.head = newHead
    }

    children.push(generatePositions(newGameState, player == players.length - 1 ? depth - 1 : depth, (player + 1) % players.length, "down"))
  }

  if (possibleMoves.left) {
    let newGameState = _.cloneDeep(gameState)
    let oldHead = newGameState.board.snakes[player].head
    let newHead: Coord = { x: oldHead.x - 1, y: oldHead.y }
    //TODO Add lookahead for eating food
    newGameState.board.snakes[player].body.pop()
    newGameState.board.snakes[player].body.unshift(newHead)
    newGameState.board.snakes[player].head = newHead

    if (player == 0) {
      newGameState.you.body.pop()
      newGameState.you.body.unshift(newHead)
      newGameState.you.head = newHead
    }

    children.push(generatePositions(newGameState, player == players.length - 1 ? depth - 1 : depth, (player + 1) % players.length, "left"))
  }

  if (possibleMoves.right) {
    let newGameState = _.cloneDeep(gameState)
    let oldHead = newGameState.board.snakes[player].head
    let newHead: Coord = { x: oldHead.x + 1, y: oldHead.y }
    //TODO Add lookahead for eating food
    newGameState.board.snakes[player].body.pop()
    newGameState.board.snakes[player].body.unshift(newHead)
    newGameState.board.snakes[player].head = newHead

    if (player == 0) {
      newGameState.you.body.pop()
      newGameState.you.body.unshift(newHead)
      newGameState.you.head = newHead
    }

    children.push(generatePositions(newGameState, player == players.length - 1 ? depth - 1 : depth, (player + 1) % players.length, "right"))
  }


  return { gameState: gameState, children: children, player: player, iWentDirection: direction }

}


export function miniMax(position: Position, depth: number, alpha: number, beta: number, player: number, players: number): [number, Direction] {

  if ((depth == 0) || isGameOver(position.gameState)) {
    return [static_eval(position.gameState), position.iWentDirection]
  }

  if (player == 0) {
    let maxEval = -1 * Infinity
    let bestMove: Direction = "donno"
    for (const childPosition of position.children) {
      let [evaluation, childBestMove] = miniMax(childPosition, depth - 1, alpha, beta, (player + 1) % players, players)
      if (evaluation > maxEval) {
        maxEval = evaluation
        bestMove = childPosition.iWentDirection
      }
      alpha = Math.max(alpha, evaluation)
      if (beta <= alpha) {
        break
      }
    }
    return [maxEval, bestMove]
  } else {
    let minEval = Infinity
    let bestMove: Direction = "donno"
    for (const childPosition of position.children) {
      let [evaluation, childBestMove] = miniMax(childPosition, depth - 1, alpha, beta, (player + 1) % players, players)
      if (evaluation > minEval) {
        minEval = evaluation
        bestMove = childPosition.iWentDirection
      }
      beta = Math.min(beta, evaluation)
      if (beta <= alpha) {
        break
      }
    }
    return [minEval, bestMove]
  }


}


