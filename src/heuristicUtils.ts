import { HEIGHT, WIDTH } from "./constants";
import { GridCell } from "./gridCell";
import { Battlesnake, Coord } from "./types";



interface FloodFillCell extends GridCell {
  explored?: boolean
}

function isFree(cell: GridCell) {
  return !cell.isSnake
}

function isOnBoard(coord: Coord) {
  return (0 <= coord.x && coord.x < WIDTH) && (0 <= coord.y && coord.y < HEIGHT)
}


function printCell(cell: GridCell) {
  if (cell.isFood) {
    process.stdout.write("F")
  } else if (cell.isHead) {
    process.stdout.write("H")
  } else if (cell.isSnake) {
    process.stdout.write("S")
  } else {
    process.stdout.write("X")
  }
}

export function printGrid(grid: GridCell[][]) {
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      printCell(grid[y][x])
    }
    console.log()
  }
}

export function clearGrid(grid: GridCell[][]) {
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      grid[y][x] = {
        isSnake: false,
        isOurself: false,
        isFood: false,
        isHead: false,
        likelyMove: "",
        x: x,
        y: y
      }
    }
  }
}

export function toSimpleGrid(grid: GridCell[][]): number[][] {
  let simpleGrid: number[][] = []
  for (let y = 0; y < HEIGHT; y++) {
    let simpleGridRow: number[] = []
    for (let x = 0; x < WIDTH; x++) {
      simpleGridRow.push(isFree(grid[y][x]) ? 0 : 1)
    }
    simpleGrid.push(simpleGridRow)
  }
  return simpleGrid
}

export function canWinHeadOn(you: Battlesnake, them: Battlesnake) {
  return you.length > them.length
}

export function getSquaredDistance(you: Coord, destination: Coord): number {
  return (you.x - destination.x) * (you.x - destination.x) + (you.y - destination.y) * (you.y - destination.y)
}

function availableSpaceHelper(grid: FloodFillCell[][], start: Coord): number {
  //uses flood filling

  let leftAvailableSpace = 0
  let downAvailableSpace = 0
  let upAvailableSpace = 0
  let rightAvailableSpace = 0

  if (!isOnBoard(start)) {
    return 0
  }

  const startCell = grid[start.y][start.x]


  if (!isFree(startCell)) {
    return 0
  }


  if (!startCell.explored) {
    startCell.explored = true

    if (startCell.x >= 1 && isFree(grid[startCell.y][startCell.x - 1])) {
      leftAvailableSpace = availableSpaceHelper(grid, grid[startCell.y][startCell.x - 1])
    }
    if (startCell.y >= 1 && isFree(grid[startCell.y - 1][startCell.x])) {
      downAvailableSpace = availableSpaceHelper(grid, grid[startCell.y - 1][startCell.x])
    }
    if (startCell.y + 1 < HEIGHT && isFree(grid[startCell.y + 1][startCell.x])) {
      upAvailableSpace = availableSpaceHelper(grid, grid[startCell.y + 1][startCell.x])
    }
    if (startCell.x + 1 < WIDTH && isFree(grid[startCell.y][startCell.x + 1])) {
      rightAvailableSpace = availableSpaceHelper(grid, grid[startCell.y][startCell.x + 1])
    }

    // console.log("explored " + startCell.y + "\t" + startCell.x)
    return 1 + upAvailableSpace + downAvailableSpace + leftAvailableSpace + rightAvailableSpace

  }


  return 0





}

export function availableSpace(grid: FloodFillCell[][], start: Coord): number {
  //uses flood filling

  let gridCopy = JSON.parse(JSON.stringify(grid))

  return availableSpaceHelper(gridCopy, start)



}