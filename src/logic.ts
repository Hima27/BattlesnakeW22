import { InfoResponse, GameState, MoveResponse } from "./types"
import { Heuristic } from "./heuristic"
import { HEIGHT, WIDTH } from "./constants"



const heuristic = new Heuristic(WIDTH, HEIGHT)

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


export function move(gameState: GameState): MoveResponse {

  const move = heuristic.move(gameState)

  console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${move}`)
  return move
}
