// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InitialParametersEmitter {
    // Event to notify external observers, parameterized to include initial states and total steps information
    event GameStateEmitted(uint256 player1State, uint256 player2State, uint256 totalSteps);

    // Function to trigger the event and pass initial states and steps information
    function emitGameState(uint256 player1, uint256 player2, uint256 steps) external {
        // Trigger the event
        emit GameStateEmitted(player1, player2, steps);
    }
}
