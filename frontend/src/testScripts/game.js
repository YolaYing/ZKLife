import React, { useState, useEffect } from 'react';
import anime from 'animejs';
import './game.css';

const GameOfLife = () => {
  const N = 50;
  const ON = 255, OFF = 0;
  const [grid, setGrid] = useState(Array(N).fill().map(() => Array(N).fill(OFF)));

  // Randomly switch between ON and OFF values
  useEffect(() => {
    const randomizeGrid = () => {
      const newGrid = grid.map(row => row.map(cell => Math.random() < 0.5 ? ON : OFF));
      setGrid(newGrid);
    };

    randomizeGrid();
  }, []);


  useEffect(() => {
    let newGrid = JSON.parse(JSON.stringify(grid));
    for(let i = 0; i < N; i++) {
      for(let j = 0; j < N; j++) {
        let total = grid[(i-1+N)%N][j] + grid[(i+1)%N][j] +
                    grid[i][(j-1+N)%N] + grid[i][(j+1)%N] +
                    grid[(i-1+N)%N][(j-1+N)%N] + grid[(i-1+N)%N][(j+1)%N] +
                    grid[(i+1)%N][(j-1+N)%N] + grid[(i+1)%N][(j+1)%N];
        total = total / ON;
        if(grid[i][j] === ON) {
          if(total < 2 || total > 3) newGrid[i][j] = OFF;
        } else {
          if(total === 3) newGrid[i][j] = ON;
        }
      }
    }
    anime({
      targets: newGrid,
      easing: 'linear',
      round: 1,
      update: () => setGrid(newGrid)
    });
  }, [grid]);

  return (
    <div className="grid">
      {grid.map((row, i) => (
        <div key={i} className="row">
          {row.map((cell, j) => (
            <div key={j} className={`cell ${cell === ON ? 'on' : 'off'}`}></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameOfLife;