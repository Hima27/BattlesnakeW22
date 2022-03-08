import { GridCell } from "../src/gridCell"
import { HEIGHT, WIDTH } from "../src/constants"
import { availableSpace } from "../src/heuristicUtils"





describe('heuristic utils', () => {

  let grid: GridCell[][] = []




  describe('availableSpace', () => {

    beforeEach(() => {
      grid = []
      for (let y = 0; y < HEIGHT; y++) {
        let gridRow: GridCell[] = []
        for (let x = 0; x < WIDTH; x++) {
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
        grid.push(gridRow)
      }
    })


    it('should see entire grid as available', () => {
      expect(availableSpace(grid, { x: Math.floor(WIDTH / 2), y: Math.floor(HEIGHT / 2) })).toBe(WIDTH * HEIGHT)
    })

    it('should not explore wall', () => {
      for (let y = 0; y < HEIGHT; y++) {
        grid[y][Math.floor((WIDTH / 2) - 2)].isSnake = true
      }

      expect(availableSpace(grid, { x: Math.floor(WIDTH / 2) - 1, y: Math.floor(HEIGHT / 2) - 1 })).toBe((Math.floor(WIDTH / 2) + 2) * HEIGHT)
    })


  })



})