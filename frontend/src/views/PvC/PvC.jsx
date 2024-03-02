import React, { useState, useEffect } from 'react';
import './PvC.css';
import { Button, message, Input,  Modal } from 'antd';
import domtoimage from 'dom-to-image';
import axios from 'axios';

const { Web3 } = require('web3');
const web3 = new Web3(window.ethereum);
const abi = require("../../artifacts/abi.json");
const contractABI = [...abi]; // 用你的智能合约 ABI 替换这里的空数组

const PvP = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [account, setAccount] = useState();

  const gridWidth = 16;
  const gridHeight = 16;
  const cellSize = 25;
  const [grid, setGrid] = useState(Array(gridWidth).fill().map(() => Array(gridHeight).fill(0)));
  const [playerTurn, setPlayerTurn] = useState(1);
  const [steps, setSteps] = useState(null);
  const [blockNumber, setBlockNumber] = useState(null);
  // const [clickable, setClickable] = useState(true);

  async function connect() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });
    const account = accounts[0];
    setAccount(account);
  }

  // const handleTest = async () => {
  //   let arr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,1,0,1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2,0,1,0,0,0,0,0,0,0,0,0,2,0,2,0,0,0,0,0,2,0,0,0,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  //   let nest = []
  //   for (let i = 0; i < 16; i ++) {
  //     nest.push(arr.splice(0, 16));
  //   }
  //   setGrid(nest);
  //   console.log(nest);
  // }

  const disconnect = async () => {
    console.log(`disconnecting..`);
    try {
      await window.ethereum.request({
        "method": "wallet_revokePermissions",
        "params": [
          {
            "eth_accounts": {}
          }
        ]
      }).then(() => {
        console.log('Wallet disconnected!')
        messageApi.open({
          type: 'success',
          content: 'Wallet disconnected!',
        });
        setAccount(undefined);
      })
    } catch(err) {
      console.warn(`failed to disconnect..`, err);
    }
  }

  useEffect(() => {
    if (playerTurn === 2) {
      // If it's AI's turn, make AI move
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      
      return () => clearTimeout(timer); // Clear the timer when the component unmounts or when playerTurn changes
    }
  }, [playerTurn]);

  const handleClick = (i, j) => {
    // Handle user's click
    if (playerTurn === 1) {
      let newGrid = JSON.parse(JSON.stringify(grid));
      if (newGrid[i][j] === 0) {
        newGrid[i][j] = playerTurn;
        setGrid(newGrid);
        setPlayerTurn(2); // Switch turn to AI after user's move
      }
    }
  };

  const makeAIMove = () => {
    // Logic for AI move
    const [aiX, aiY] = aiMove();
    if (aiX !== null && aiY !== null) {
      let newGrid = JSON.parse(JSON.stringify(grid));
      newGrid[aiX][aiY] = playerTurn;
      setGrid(newGrid);
      setPlayerTurn(1); // Switch turn back to user after AI's move
    }
  };

  // Function for AI player to make a move
  const aiMove = () => {
    // Implement your AI logic here to determine AI's move
    // For now, let's assume a random move
    const emptyCells = [];
    for (let i = 0; i < gridWidth; i++) {
      for (let j = 0; j < gridHeight; j++) {
        if (grid[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      return emptyCells[randomIndex];
    } else {
      return [null, null];
    }
  };

// Call the emitGameState function
async function callEmitGameState(player1State, player2State, totalSteps) {
  try {
    if (account === undefined) {
      messageApi.open({
        type: 'error',
        content: 'Wallet not connected!',
      });
    } else {
      // Call the emitGameState function using send
      const contract = new web3.eth.Contract(contractABI, '0xAB277B00C67DeCb5A8e55041B5ac8BEECd613433');
      messageApi
      .open({
        type: 'loading',
        content: 'Start generating result..',
        duration: 0,
      })
      const result = await contract.methods.emitGameState(player1State, player2State, totalSteps).send({
        from: account,
      })

      console.log('Transaction Hash:', result.transactionHash);
      
      await web3.eth.getTransactionReceipt(result.transactionHash).then((transaction) => {
        console.log(transaction);
        const blockNumber = transaction.blockNumber;
        console.log('Block Number:', blockNumber);
        setBlockNumber(blockNumber);

        setTimeout(messageApi.destroy, 0);

        handleExec(blockNumber)
     }).catch((err) => {
      console.error('Error getting transaction details:', err);
    })}

    } catch (error) {
      console.error('Error calling emitGameState:', error);
    }
}

  const handleInput = (e) => {
    setSteps(e.target.value); 
  }

  const handleConfirm = async () => {
    let reg = /^[0-9]*$/
    if (reg.test(steps) && steps <= 40 && steps >= 5) {
      let [bitsInt1, bitsInt2] = gridTo256Bits(grid);

      await callEmitGameState(bitsInt1, bitsInt2, parseInt(steps))
      console.log(bitsInt1, bitsInt2);
      // handleExec(5197190n)
    } else {
      messageApi.open({
        type: 'error',
        content: 'Please enter valid number number of steps!',
      });
      return;
    }
  }

  const printImage = async () => {
    let image = null
    await domtoimage.toJpeg(document.getElementById('outer-box'))
    .then(function (dataUrl) {
      image = dataUrl
      // console.log(dataUrl);
    });

    return image
  }

  const getImgAndMintNFT = async (winnerBinary, ownerAddress, competitor) => {
    let dataUrl = await printImage();

    let data = {
      dataUrl: dataUrl,
      ownerAddress: ownerAddress,
      gameInfo: {
        mode: 'PvP',
        winner: winnerBinary === 0n ? 'Draw' : winnerBinary === 1n ? 'BLACK' : 'RED',
        competitor: competitor,
        steps: steps,
      }
    }

    console.log(data)

    let result = null
    await axios.post(`http://localhost:3001/mintNFT`, data)
    .then(response => {
      console.log(response);
      result = response.data.ret
    })
    .catch(error => {
      console.error('There was an error!', error);
    });

    return result
  }

  function gridTo256Bits(grid) {
    // Flatten the grid into a single array
    let flattenedGrid = [].concat(...grid);
  
    // Convert the array into a binary string
    let binaryString1 = flattenedGrid.map(cell => cell === 1 ? '1' : '0').join('');
    let binaryString2 = flattenedGrid.map(cell => cell === 2 ? '1' : '0').join('');

    /* global BigInt */
    // Convert the binary string into a BigInt
    let bitsInt1 = BigInt('0b' + binaryString1);
    let bitsInt2 = BigInt('0b' + binaryString2);
  
    return [bitsInt1, bitsInt2];
  }

  async function BitsToGrid(bits1, bits2) {
    let flattenedGrid = [];
    for (let i = 0; i < 256; i++) {
      if (bits1 & 1n) {
        flattenedGrid.unshift(1);
      } else if (bits2 & 1n) {
        flattenedGrid.unshift(2);
      } else {
        flattenedGrid.unshift(0);
      }
      bits1 >>= 1n;
      bits2 >>= 1n;
    }

    let newGrid = [];
    for (let i = 0; i < 16; i++) {
      newGrid.push(flattenedGrid.slice(i * 16, (i + 1) * 16));
    }

    // setGrid(new Array(256).fill(0));
    // setGrid(newGrid);
    console.log('set')
    return newGrid;
  }

  const handleExec = async (blockNum) => {
    // let blockNum = 5179223
    await axios.post(`http://localhost:3001/api?blockNum=${blockNum}`)
    .then(async (response) => {
      let arr = Object.values(response.data)
      console.log(arr);

      // render by frame
      await renderResult(arr)
      messageApi
      .open({
        type: 'success',
        content: 'Game result generated!',
      })
    })
    .catch(error => {
      console.error('There was an error!', error);
    });
  }

  const renderResult = async (arr) => {
    arr.splice(0, 4);
    let winnerArr = arr.splice(arr.length - 4, 4);
    // const lastFourElements = arr.slice(-4);
    // console.log(winnerArr, lastFourElements);
    
    let gridArr = [];
    let numOfGrid = arr.length / 32 / 2;
    console.log('num of grid', numOfGrid);
    
    for (let i = 0; i < numOfGrid; i++) {
      console.log(arr.slice(0, 32), arr.slice(32, 64));
      let player1Arr = arr.splice(0, 32);
      let player1Hex = player1Arr
        .map((num) => num.toString(16).padStart(2, '0'))
        .join('');
      let player1Binary = BigInt('0x' + player1Hex);

      let player2Arr = arr.splice(0, 32);
      let player2Hex = player2Arr
        .map((num) => num.toString(16).padStart(2, '0'))
        .join('');
      let player2Binary = BigInt('0x' + player2Hex);

      
      // console.log(player1Binary, player2Binary);
      let newGrid = await BitsToGrid(player1Binary, player2Binary);
      gridArr.push(newGrid);
    }

    let winnerHex = winnerArr
    .map((num) => num.toString(16).padStart(2, '0'))
    .join('');
    let winnerBinary = BigInt('0x' + winnerHex);

    console.log('result', winnerBinary);

    // setClickable(false);

    const promises = gridArr.map((grid, i) => {
      return new Promise(resolve => {
        setTimeout(async () => {
          await iterateGrid(grid);
          resolve();
        }, 1000 * i);
      });
    });

    await Promise.all(promises);

    const startMint = async () => {
      messageApi
      .open({
        type: 'loading',
        content: 'Start minting NFT...',
        duration: 0,
      })

      // draw
      if (winnerBinary === 0n || winnerBinary === 1n) {
        let txn = await getImgAndMintNFT(winnerBinary, account, 'AI Agent')
        const promises = [new Promise(resolve => {
          setTimeout(async () => {
            messageApi.destroy();
            resolve();
          }, 0);
        })]
    
        await Promise.all(promises);
    
        // setTimeout(messageApi.destroy, 0);

        await messageApi
        .open({
          type: 'success',
          content: 'NFT minted for you!',
        })

        await Modal.success({
          centered: true,
          content: `Check your NFT: \n ${txn}`,
        })
      }
    }

    if (winnerBinary === 0n || winnerBinary === 1n) {
      await Modal.success({
        centered: true,
        content: winnerBinary === 0n ? 'Draw! You won an NFT!' : 'Congradulations! You beat the AI Agent and won an NFT!',
        async onOk() {
          startMint()
        },
      })
    } else {
      await Modal.error({
        centered: true,
        content: 'Oops! You lost to the AI Agent! Better luck next time!'
      })
    }
    // setClickable(true);
  }

  const iterateGrid = async (arr) => {
    setGrid(arr);
  }

  return (
    <div className='wrapper'>
      {contextHolder}
      <Button className="back-btn" type="link" size="large" href="/">
        Back to Home
      </Button>

      <p className='name'>Game of Life - PvC Game</p>
      <Button className='wallet-btn' onClick={connect}>Connect Wallet</Button>
      {account && (
        <div className='wallet-detail'>
          <>
            {/* {chainId && `Connected chain: ${chainId}`} */}
            <p></p>
            {account && `Connected account: ${account}`}
          </>
        </div>
      )}
      {account && (
        <Button type="link" danger className='wallet-btn' onClick={disconnect}>Disconnect Wallet</Button>
      )}

      <div id="outer-box">
        <div className="grid" id="grid" style={{width: gridWidth * cellSize, height: gridHeight * cellSize}}>
          {grid.map((row, i) => (
            <div key={i} className="row">
              {row.map((cell, j) => (
                <div key={j} className={`cell ${cell === 1 ? 'player1' : cell === 2 ? 'player2' : 'empty'}`} style={{width: cellSize, height: cellSize}} onClick={() => handleClick(i, j)}></div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className='tip'>
        <div className='cell player1' style={{width: cellSize, height: cellSize}}></div>
        <p className='tip-text'>Player</p>
      </div>
      <div className='tip'>
        <div className='cell player2' style={{width: cellSize, height: cellSize}}></div>
        <p className='tip-text'>AI Agent</p>
      </div>
      <div className='tip'>
        <Input className='step-input' size="large" value={steps} onChange={handleInput} placeholder="Please enter number of steps from 5 to 40" />
        <Button type="primary" size="large" className='confirm-btn' onClick={handleConfirm}>Confirm</Button>
      </div>

      {/* <Button onClick={handleTest}>test</Button> */}

      {/* <Button type="primary" onClick={getImgAndMintNFT}>Save as Image</Button> */}
    </div>
  );
};

export default PvP;