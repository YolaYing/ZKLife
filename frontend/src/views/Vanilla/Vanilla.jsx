import React, { useState } from 'react';
import './Vanilla.css';
import { Button, message, Input,  Modal } from 'antd';
import domtoimage from 'dom-to-image';
import axios from 'axios';


const { Web3 } = require('web3');
const web3 = new Web3(window.ethereum);
const abi = require("../../artifacts/abi.json");
const contractABI = [...abi]; // 用你的智能合约 ABI 替换这里的空数组

const Vanilla = () => {
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

  const handleClick = (i, j) => {
      let newGrid = JSON.parse(JSON.stringify(grid));
      if(newGrid[i][j] === 0) {
        newGrid[i][j] = playerTurn;
        setPlayerTurn(playerTurn === 1 ? 2 : 1);
      }
      setGrid(newGrid);
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
      const contract = new web3.eth.Contract(contractABI, '0x53625ceb90dd1b91f15d3aff3a1137d85a6b868c');
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
        // messageApi
        // .open({
        //   type: 'success',
        //   content: 'Game result success!',
        // })


        handleExec(blockNumber)
      }).catch((err) => {
        console.error('Error getting transaction details:', err);
      })}

    } catch (error) {
      console.error('Error calling emitGameState:', error);
    }
}

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

    await axios.post(`http://localhost:3001/mintNFT`, data)
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.error('There was an error!', error);
    });
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

    await Modal.success({
      centered: true,
      content: `Game session finished!`,
    })
    // setClickable(true);
  }

  const iterateGrid = async (arr) => {
    setGrid(arr);
  }

  return (
    <div className='wrapper'>
      {contextHolder}
      <Button type="link" className="back-btn" size="large" href="/">
        Back to Home
      </Button>
      <p className='name'>Game of Life - Vanilla</p>
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
                <div key={j} className={`cell ${cell === 1 ? 'player1' : cell === 2 ? 'player1' : 'empty'}`} style={{width: cellSize, height: cellSize}} onClick={() => handleClick(i, j)}></div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className='tip'>
        <div className='cell player1' style={{width: cellSize, height: cellSize}}></div>
        <p className='tip-text'>Player 1</p>
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

export default Vanilla;