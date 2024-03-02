require('dotenv').config()
const { Web3 } = require('web3');

const abi = require("../artifacts/abi.json");

console.log(process.env.API_URL);
const web3 = new Web3(process.env.API_URL);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = [...abi]; // 用你的智能合约 ABI 替换这里的空数组
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Specify the values to be passed to the emitGameState function
const player1State =  12259964418271227259165020387867311922165661543050510336n;
const player2State = 49041447421489859511525162441559008579159965201382506496n;
const totalSteps = 20;

// Call the emitGameState function
async function callEmitGameState() {
  try {
    // Get the account that will send the transaction
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    console.log('Account:', account);

    // Call the emitGameState function using send
    // const result = await contract.methods.emitGameState(player1State, player2State, totalSteps).send({
    //   from: account,
    // });

    console.log('Transaction Hash:', result.transactionHash);
  } catch (error) {
    console.error('Error calling emitGameState:', error);
  }
}

console.log('Calling emitGameState...');
// Execute the function
callEmitGameState();
