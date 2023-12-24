import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './game.css';

const GridGame = () => {
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gridData, setGridData] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [direction, setDirection] = useState(1);
  const [maxNum, setMaxNum] = useState(0);
  let gridInterval;
  

  useEffect(() => {
    const fetchGridData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/grid');
        setGridData(response.data);
      } catch (error) {
        console.error('Error fetching grid data:', error);
      }
    };

    fetchGridData();
  }, []);

  useEffect(() => {
    // Update the grid interval speed when the speed changes
    updateSpeed();
  }, [speed]);

  useEffect(() => {
    if (isGameRunning) {
      // Adjust interval based on animationSpeed
      gridInterval = setInterval(() => {
        moveRedGrids();
      }, 1000/speed); // Increase the interval to a reasonable value
    } else {
      // Clear the interval to stop the animation when the game is stopped
      clearInterval(gridInterval);
    }

    // Cleanup function to clear interval when the component unmounts or game stops
    return () => clearInterval(gridInterval);
  }, [isGameRunning, ]);

  // Handle clicks on the grid
  const handleGridClick = async (row, col) => {
    if (isGameRunning) {
      try {
        const response = await axios.post('http://localhost:5000/click', { row, col });
        setScore((prevScore) => prevScore + response.data.score);
        // Add logic for blinking animation here
      } catch (error) {
        console.error('Error handling grid click:', error);
      }
    }
  };

  // Additional function to move red grids
  const moveRedGrids = () => {
    let newCol, temp = 0;
    const maxColumn = Math.max(...gridData.movingRedGrids.map((grid) => grid.col));
  
    if (isGameRunning) {
      // Get the current position of red grids
      const updatedRedGrids = gridData.movingRedGrids.map((grid) => {
        if(direction && maxColumn < 10){
          // moving right
          const updatedCol = grid.col + 1;
          temp = temp > updatedCol ? temp : updatedCol;
          newCol = updatedCol > gridData.cols ? gridData.col : updatedCol;
          console.log(newCol)
          if(temp == 10){
            setDirection(0)
          }
        }
        else{
          // moving left
          const updatedCol = grid.col -1;
          temp = temp > updatedCol ? temp : updatedCol;
          newCol = updatedCol < 3 ? gridData.col : updatedCol;
          if(maxColumn == 4){
            console.log("previous",direction)
            setDirection(1)
            console.log("after",direction)
          }
        }
        let ans =  { ...grid, col: newCol };
        return ans;
      });
  
      // Update the grid data with the new positions of red grids
      setMaxNum(temp)
      setGridData((prevGridData) => {
        const updatedGridData = {
          ...prevGridData,
          movingRedGrids: updatedRedGrids,
        };
  
        // Execute any logic or side effects after updating the state
        // This will ensure that you're working with the updated state
        console.log("Grid data updated:", updatedGridData);
  
        return updatedGridData;
      });
    }
  };
  
  // Start the game
  const startGame = () => {
    setIsGameRunning(true);
    setScore(0);
    fetchGridData();
    setTimeout(() => {
      moveRedGrids();
    }, 1000 / speed);
  };

  // Stop the game and reset
  const stopGame = () => {
    setIsGameRunning(false);
    // Clear the interval to stop the animation
    clearInterval(gridInterval);
  };

  // Update the speed of the grid animation
  const updateSpeed = () => {
    axios.post('http://localhost:5000/speed', { speed });
    // Update animation speed based on the game speed
    setAnimationSpeed(speed);
  };

  // Fetch grid data from the backend
  const fetchGridData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/grid');
      setGridData(response.data);
    } catch (error) {
      console.error('Error fetching grid data:', error);
    }
  };

  // Render the grid based on the grid data
  const renderGrid = () => {
    console.log(gridData)
    if (!gridData || !gridData.rows || !gridData.cols) {
      console.log("Grid data is missing");
      return null; // If not, return null
    }

    const { rows, cols, greenGrids, randomBlueGrids, movingRedGrids } = gridData;

    return (
      <div className="grid-container">
        {/* Map over each row in the grid */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {/* Map over each cell in the row */}
            {Array.from({ length: cols }).map((_, colIndex) => {
              // Calculate the index to get the corresponding cell color
              const cellIndex = rowIndex * cols + colIndex;

              // Determine the color of the cell based on the data from the backend
              const cellColor = (
                greenGrids.some((grid) => grid.row === rowIndex + 1 && grid.col === colIndex + 1) ? 'green' :
                randomBlueGrids.some((grid) => grid.row === rowIndex + 1 && grid.col === colIndex + 1) ? 'blue' :
                movingRedGrids.some((grid) => grid.row === rowIndex + 1 && grid.col === colIndex + 1) ? 'red' : ''
              );

              return (
                <div
                  key={colIndex}
                  className={`grid-cell ${cellColor}`}
                  onClick={() => handleGridClick(rowIndex + 1, colIndex + 1)}
                >
                  {/* Display 1x1 box if the cell has a color */}
                  {cellColor && <div className={`box ${cellColor}-box`}></div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="game-container">
      <h1>Grid Game</h1>
      <div className="controls">
        <button onClick={startGame} disabled={isGameRunning} className='btn '>
          Start
        </button>
        <button onClick={stopGame} disabled={!isGameRunning} className='btn '>
          Stop
        </button>
        <label className='label-h'>
          Speed:
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className='label-drop'>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </label>
      </div>
      <div className="score">Score: {score}</div>
      {renderGrid()}
    </div>
  );
};

export default GridGame;
