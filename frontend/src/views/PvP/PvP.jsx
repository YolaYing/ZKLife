import React, { useState } from 'react';
import './PvP.css';
import { Button, message, Input,  Modal } from 'antd';
import domtoimage from 'dom-to-image';
import axios from 'axios';

import { ethers, JsonRpcProvider } from 'ethers'


const { Web3 } = require('web3');
const web3 = new Web3("https://eth-sepolia.g.alchemy.com/v2/SqLPjolUE4Mf_Z3csoneWHGVhz17wMva");
const abi = require("../../artifacts/abi.json");
const contractABI = [...abi]; // 用你的智能合约 ABI 替换这里的空数组

const PvP = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [player1Account, setPlayer1Account] = useState(null);
  const [player2Account, setPlayer2Account] = useState(null);

  const gridWidth = 16;
  const gridHeight = 16;
  const cellSize = 25;
  const [grid, setGrid] = useState(Array(gridWidth).fill().map(() => Array(gridHeight).fill(0)));
  const [playerTurn, setPlayerTurn] = useState(1);
  const [steps, setSteps] = useState(null);
  const [blockNumber, setBlockNumber] = useState(null);
  // const [clickable, setClickable] = useState(true);

  const handleClick = (i, j) => {
      let newGrid = JSON.parse(JSON.stringify(grid));
      if(newGrid[i][j] === 0) {
        newGrid[i][j] = playerTurn;
        setPlayerTurn(playerTurn === 1 ? 2 : 1);
      }
      setGrid(newGrid);
  };

const checkWalletAddress = () => {
  if (player1Account === null || player2Account === null) {
    return false
  } else {
    let reg = /^0x[a-fA-F0-9]{40}$/
    if (reg.test(player1Account) && reg.test(player2Account)) {
      return true
    } else {
      return false
    }
  }
}

// Call the emitGameState function
async function callEmitGameState(player1State, player2State, totalSteps) {
  try {
    if (checkWalletAddress() === false) {
      messageApi.open({
        type: 'error',
        content: 'Please enter valid player addresses!',
      });
    } else {
      const provider = new JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/SqLPjolUE4Mf_Z3csoneWHGVhz17wMva");
      let privateKey =  '0x3c1642e5bf2a6b63a6b828c9a08710de227e8e5bb73aa0719ba9b2a5bff8cc61';
      const wallet = new ethers.Wallet(privateKey);
      const connectedWallet = wallet.connect(provider);

      // Call the emitGameState function using send
      const contract = new ethers.Contract('0x53625ceb90dd1b91f15d3aff3a1137d85a6b868c', contractABI, connectedWallet);
      messageApi
      .open({
        type: 'loading',
        content: 'Start generating result..',
        duration: 0,
      })

      const transaction = await contract.emitGameState(player1State, player2State, totalSteps);
      const receipt = await transaction.wait();
      console.log(receipt);

      let blockNumber = receipt.blockNumber; 

      console.log('Block Number:', blockNumber);
      setBlockNumber(blockNumber);

      setTimeout(messageApi.destroy, 0);


      await handleExec(blockNumber)
    }

    } catch (error) {
      console.error('Error calling emitGameState:', error);
    }
}

  const handleInput = (e) => {
    setSteps(e.target.value); 
  }

  const handleConfirm = async () => {
    let reg = /^[0-9]*$/
    if (reg.test(steps) && steps <= 10 && steps >= 5) {
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

  const downloadImg = () => {
    domtoimage.toJpeg(document.getElementById('outer-box'))
    .then(function (dataUrl) {
       console.log(dataUrl);
        var link = document.createElement('a');
        link.download = 'game-of-life.jpeg';
        link.href = dataUrl;
        link.click();
    });
    // console.log(gridTo256Bits(grid));
    // BitsToGrid(12259964418271227259165020387867311922165661543050510336n, 49041447421489859511525162441559008579159965201382506496n);
    // 12259964418271227259165020387867311922165661543050510336n, 49041447421489859511525162441559008579159965201382506496n]
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
      if (winnerBinary === 0n) {
        let txn1 = await getImgAndMintNFT(winnerBinary, player1Account, player2Account)
        let txn2 = await getImgAndMintNFT(winnerBinary, player2Account, player1Account)
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
          content: 'NFT minted for both players!',
        })

        await Modal.success({
          centered: true,
          content: `Check your NFT: \n Player 1: ${txn1}\n Player 2: ${txn2}`,
        })
      } else {
        let ownerAddress = null
        let competitor = null
        if (winnerBinary === 1n) {
          ownerAddress = player1Account;
          competitor = player2Account;
        } else {
          ownerAddress = player2Account;
          competitor = player1Account;
        }
        let txn = await getImgAndMintNFT(winnerBinary, ownerAddress, competitor)
        // setTimeout(messageApi.destroy, 0);
        const promises = [new Promise(resolve => {
          setTimeout(async () => {
            messageApi.destroy();
            resolve();
          }, 0);
        })]
    
        await Promise.all(promises);

        await messageApi
        .open({
          type: 'success',
          content: `NFT minted for winner ${ownerAddress} !`,
        })

        await Modal.success({
          centered: true,
          content: `Check your NFT: \n ${txn}`,
        })
      }
    }

    await Modal.success({
      centered: true,
      content: winnerBinary === 0n ? 'Draw!' : `${winnerBinary === 1n ? 'Player 1' : 'Player 2'} wins the game!`,
      async onOk() {
        startMint()
      },
    })
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
      <p className='name'>Game of Life - PvP Game</p>
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

        <div className="player-address-box">
          <p>Please enter your wallet address, and the winner will win an NFT!</p>
          <Input placeholder="Player 1 Wallet Address: 0x..." onChange={(e) => {
            setPlayer1Account(e.target.value);
          }} />
          <Input placeholder="Player 2 Wallet Address: 0x..." onChange={(e) => {
            setPlayer2Account(e.target.value);
          }} />
        </div>
      </div>

      <div className='tip'>
        <div className='cell player1' style={{width: cellSize, height: cellSize}}></div>
        <p className='tip-text'>Player 1</p>
      </div>
      <div className='tip'>
        <div className='cell player2' style={{width: cellSize, height: cellSize}}></div>
        <p className='tip-text'>Player 2</p>
      </div>
      <div className='tip'>
        <Input className='step-input' size="large" value={steps} onChange={handleInput} placeholder="Please enter number of steps from 5 to 10" />
        <Button type="primary" size="large" className='confirm-btn' onClick={handleConfirm}>Confirm</Button>
      </div>

      {/* <Button onClick={handleTest}>test</Button> */}

      {/* <Button type="primary" onClick={getImgAndMintNFT}>Save as Image</Button> */}
    </div>
  );
};

export default PvP;