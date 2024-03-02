require('dotenv').config();

// NFT contract
const GameOfLifeNFT_ContractAddress = process.env.NFT_CONTRACT_ADDRESS
const GameOfLifeNFT_ContractABI = require('./GameOfLifeNFT/GameOfLifeNFT.json').abi

// pinata
const PINATA_JWT = process.env.PINATA_JWT
const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK({ pinataJWTKey: PINATA_JWT });

// web3 api
const { ethers } = require('ethers')
const API_KEY = process.env.API_KEY
const API_URL = process.env.API_URL
const provider = new ethers.providers.JsonRpcProvider(API_URL);
// const provider = new ethers.AlchemyProvider('sepolia', API_KEY)

// wallet
const privateKey = process.env.PRIVATE_KEY
const signer = new ethers.Wallet(privateKey, provider)

const uploadFileToIPFS = async function(dataUrl) {
  // 移除数据 URL 的前缀以获取纯粹的 base64 数据
  let base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  // 将 base64 数据转换为 Buffer
  let dataBuffer = Buffer.from(base64Data, 'base64');
  // 创建一个可读流
  let readableStream = require('stream').Readable.from(dataBuffer);

  const options = {
    pinataMetadata: {
        name: 'WinnerBoard'
    }
  };

  const res = await pinata.pinFileToIPFS(readableStream, options).catch((err) => {
    console.log(err)
  })
  console.log('\nWinner Board Snapshot uploaded to IPFS\n', res)

  let ipfsHash = res.IpfsHash
  return ipfsHash
}

const uploadMetaDataToIPFS = async function(metadata) {
  const res = await pinata.pinJSONToIPFS(metadata).catch((err) => {
    console.log(err)
  })
  console.log('\nGameOfLife NFT metadata uploaded to IPFS\n', res)


  let ipfsHash = res.IpfsHash
  return ipfsHash
}

const mint = async function(ipfsHash, ownerAddress) {
  // Get contract ABI and address
  const abi = GameOfLifeNFT_ContractABI
  const contractAddress = GameOfLifeNFT_ContractAddress

  // Create a contract instance
  const gameOfLifeContract = new ethers.Contract(contractAddress, abi, signer)

  // prepare data
  let tokenUri = `https://ipfs.io/ipfs/${ipfsHash}`

  let nftTxn = await gameOfLifeContract.mintNFT(ownerAddress, tokenUri)
  await nftTxn.wait()
  console.log(`NFT Minted! Check it out at: https://sepolia.etherscan.io/tx/${nftTxn.hash}`)

  return nftTxn.hash
}

const mintNFT = async function(dataUrl, gameInfo, ownerAddress) {
  // upload file to IPFS
  let ipfsHash = await uploadFileToIPFS(dataUrl).catch((err) => {throw err})

  // upload metadata to IPFS
  let metadata = {
    name: 'Game-of-life Winner Board',
    description: 'Winner Board of the Game of Life',
    file: `https://ipfs.io/ipfs/${ipfsHash}`,
    attributes: gameInfo
  }
  let tokenUri = await uploadMetaDataToIPFS(metadata).catch((err) => {throw err})
  console.log(tokenUri)

  // mint NFT
  let hash = await mint(tokenUri, ownerAddress).catch((err) => {throw err})

  return `https://sepolia.etherscan.io/tx/${hash}`
}

module.exports = {
  mintNFT
}