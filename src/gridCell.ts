export interface GridCell {
  // cell info - 
  // is our snake on it? 
  // is our snake's head on it?
  // is food on it? 
  // is other snake on it?
  // is other snake's head on it

  isSnake: boolean;
  isOurself: boolean;
  isFood: boolean;
  isHead: boolean;
  likelyMove: string;
  x: number;
  y: number;

}




