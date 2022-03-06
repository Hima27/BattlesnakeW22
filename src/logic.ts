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


export function move(gameState: GameState): MoveResponse {



  console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`)
  return response
}
