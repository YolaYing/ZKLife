const { ethers } = require("hardhat")

async function main() {
    const GameOfLifeNFT = await ethers.getContractFactory("GameOfLifeNFT")

    // const [deployer] = await ethers.getSigners();
    // console.log(deployer.address)
    // console.log((await deployer.getBalance()).toString())

    // const deploymentData = contract.interface.encodeDeploy()
    // const estimatedGas = await ethers.provider.estimateGas({ data: deploymentData });

    // Start deployment, returning a promise that resolves to a contract object
    const GameOfLifeNFTContract = await GameOfLifeNFT.deploy()
    GameOfLifeNFTContract.deployed()
    console.log("Contract deployed to address:", GameOfLifeNFTContract.address)
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })