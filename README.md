<<<<<<< Updated upstream
# EthDenver-Game
This is an EthDenver hackathon project and we built a game of life pro version
=======
# 🎮 **Game Of Life Pro Version**: Two-Player Evolution

This TypeScript code represents a blockchain smart contract for a cellular automaton game. The game involves two players, denoted as Player 1 and Player 2, competing on a grid. We extend our gratitude to HyperOracle for providing their remarkable product, zkgraph-lib, which plays a crucial role in enabling blockchain interactions within the zkgraph ecosystem.

## Game Overview

The game is a variation of Conway's Game of Life, where players initialize the grid with their respective positions. The grid evolves over a specified number of steps, and the winner is determined based on the final state of the grid.

## Game Logic

- Players initialize the game with their positions on the grid.
- The grid evolves according to the rules of Conway's Game of Life over a specified number of steps.
- The winner is determined by comparing the number of cells controlled by each player.
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
>>>>>>> Stashed changes
