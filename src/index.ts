import { AStarFinder } from "astar-typescript";
import express, { Request, Response } from "express"

import { info, start, move, end } from "./logic";

const app = express()
app.use(express.json())
app.use(function (req, res, next) {
    res.set("Server", "BattlesnakeOfficial/starter-snake-typescript")
    next()
})

const port = process.env.PORT || 8080

app.get("/", (req: Request, res: Response) => {
    res.send(info())
});

app.post("/start", (req: Request, res: Response) => {
    res.send(start(req.body))
});

app.post("/move", (req: Request, res: Response) => {
    res.send(move(req.body))
});

app.post("/end", (req: Request, res: Response) => {
    res.send(end(req.body))
});



// let myMatrix = [
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
// ];

// let aStarInstance = new AStarFinder({
//     grid: {
//         matrix: myMatrix
//     },
//     includeStartNode: false,
//     includeEndNode: true
// });
// let startPos = { x: 10, y: 10 };
// let goalPos = { x: 4, y: 9 };

// let myPathway = aStarInstance.findPath(startPos, goalPos);

// console.log(myPathway)



// Start the Express server
app.listen(port, () => {
    console.log(`Starting Battlesnake Server at http://0.0.0.0:${port}...`)
});
