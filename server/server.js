const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const gridData = {
  rows: 10,
  cols: 10,
  greenGrids: [
    { row: 1, col: 1 },{ row: 2, col: 1 },{ row: 3, col: 1 },{ row: 4, col: 1 },{ row: 5, col: 1 },
    { row: 6, col: 1 },{ row: 7, col: 1 },{ row: 8, col: 1 },{ row: 9, col: 1 },{ row: 10, col: 1 },
    { row: 1, col: 2 },{ row: 2, col: 2 },{ row: 3, col: 2 },{ row: 4, col: 2 },{ row: 5, col: 2 },
    { row: 6, col: 2 },{ row: 7, col: 2 },{ row: 8, col: 2 },{ row: 9, col: 2 },{ row: 10, col: 2 },
  ],
  randomBlueGrids: [
    { row: 1, col: 10 },{ row: 2, col: 6 },{ row: 3, col: 8 },{ row: 4, col: 3 },{ row: 5, col: 4 },
    { row: 6, col: 9 },{ row: 7, col: 3 },{ row: 8, col:5 },{ row: 9, col: 7 },{ row: 10, col: 8 },
    { row: 1, col: 9 },{ row: 2, col: 3 },{ row: 3, col: 5 },{ row: 4, col: 10 },{ row: 5, col: 7 },
    { row: 6, col: 3 },{ row: 7, col: 8 },{ row: 8, col:10 },{ row: 9, col: 9 },{ row: 10, col: 10 },
  ],
};

let movingRedGrids = [
  { row: 1, col: 3 },{ row: 2, col: 3 },{ row: 3, col: 3 },{ row: 4, col: 3 },{ row: 5, col: 3 },
  { row: 6, col: 3 },{ row: 7, col: 3 },{ row: 8, col: 3 },{ row: 9, col: 3 },{ row: 10, col: 3 },
  { row: 1, col: 4 },{ row: 2, col: 4 },{ row: 3, col: 4 },{ row: 4, col: 4 },{ row: 5, col: 4 },
  { row: 6, col: 4 },{ row: 7, col: 4 },{ row: 8, col: 4 },{ row: 9, col: 4 },{ row: 10, col: 4 },
];

let currentDirection = 1; // 1 for moving right, -1 for moving left
let currentSpeed = 1;

function moveRedGrids(speed) {
  movingRedGrids = movingRedGrids.map((redGrid) => ({
    row: redGrid.row,
    col: redGrid.col + currentDirection ,
  }));

  // Check if the last column is at the edge, change direction if needed
  if (movingRedGrids[movingRedGrids.length - 1].col >= 10 || movingRedGrids[0].col <= 1) {
    currentDirection *= -1;
  }
}

setInterval(() => moveRedGrids(currentSpeed), 500);

app.get('/grid', (req, res) => {
  res.json({ ...gridData, movingRedGrids });
});

app.post('/click', (req, res) => {
  const { row, col } = req.body;

  const isGreenGrid = gridData.greenGrids.some(
    (greenGrid) => greenGrid.row === row && greenGrid.col === col
  );

  const isRandomBlueGrid = gridData.randomBlueGrids.some(
    (randomBlueGrid) => randomBlueGrid.row === row && randomBlueGrid.col === col
  );

  const isMovingRedGrid = movingRedGrids.some(
    (movingRedGrid) => movingRedGrid.row === row && movingRedGrid.col === col
  );

  let score = 0;

  if (isGreenGrid) {
    // Clicked on a green grid, do nothing
  } else if (isRandomBlueGrid) {
    // Clicked on a random blue grid, add 10 points
    score += 10;
  } else if (isMovingRedGrid) {
    // Clicked on a moving red grid, subtract 10 points
    score -= 10;
  }

  res.json({ score });
});

app.post('/speed', (req, res) => {
  const { speed } = req.body;
  currentSpeed = speed;
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
