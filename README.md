# 🎮 **ZKLife**: ZK-Enhanced On-Chain AI Gaming for Game of Life

This repo represents an on-chain game of a cellular automaton, Game of Life. We built a two-player version of it! They, denoted as Player 1 and Player 2, compete on a grid for territory. You can also play it with our AI bot! We extend our gratitude to ORA (HyperOracle) for providing their remarkable product, zk oracle, which plays a crucial role in enabling blockchain interactions.

## Game Overview

Youtube link https://www.youtube.com/watch?v=8qXgFvDXKcM 1:23

The game is a variation of Conway's Game of Life, where players initialize the grid with their respective positions. The grid evolves over a specified number of steps, and the winner is determined based on the final state of the grid.

## Game Logic

- Players initialize the game with their positions on the grid.
- The grid evolves according to the rules of Conway's Game of Life (slightly modified for two-player competition) over a specified number of steps.
- The winner is determined by comparing the number of cells.
  - If Player 1 controls more cells, they win (return value: 0).
  - If Player 2 controls more cells, they win (return value: 1).
  - If both players control an equal number of cells, the game is a tie (return value: 2).

## Get Started
### Frontend Set-up
1. Enter the frontend project folder 'frontend'
2. Download the dependencies by running the command:
   ```
   npm install
   ```
4. Launch the frontend server by running the command:
   ```
   npm run start
   ```

### Backend Set-up
1. Enter the frontend project folder 'backend'
2. Download the dependencies by running the command:
   ```
   npm install
   ```
3. Be at the location of server.js
4. Launch the backend server by running
   ```
   node server.js
   ```
## Appendix
the contract we used has been has been deployed on the sepolia testnet, address: https://sepolia.etherscan.io/address/0x53625ceb90dd1b91f15d3aff3a1137d85a6b868c
