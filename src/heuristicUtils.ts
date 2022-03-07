import { HEIGHT, WIDTH } from "./constants";
import { GridCell } from "./gridCell";
import { Coord } from "./types";



interface FloodFillCell extends GridCell {
  explored?: boolean
}

function isFree(cell: GridCell) {
  return !cell.isSnake
}

function isOnBoard(coord: Coord) {
  return (0 <= coord.x && coord.x < WIDTH) && (0 <= coord.y && coord.y < HEIGHT)
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