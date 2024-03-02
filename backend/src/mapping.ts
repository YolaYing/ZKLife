//@ts-ignore
//import { require } from "@hyperoracle/zkgraph-lib";
import { Bytes, Block, Event, BigInt, ByteArray } from "@hyperoracle/zkgraph-lib";
import {intToChessboard, Chessboard, playerInts, chessboardToInt} from "./utilities"
import { bytesToBase58 } from "@hyperoracle/zkgraph-lib/utils/conversion";

//const random: number = Math.random;
//let winner: u32 = 3; // 0: red, 1: blue, 2: even, 3: not decided
const gridWidth: i32 = 16;
const gridHeight: i32 = 16;
//let grid: number[][] = Array.from({ length: gridWidth }, () => Array(gridHeight).fill(0));


//5179223

function newBoard(): Chessboard {

  let board: Chessboard = new Array<Array<i32>>(gridHeight);

// 初始化数组
for (let i = 0; i < gridHeight; i++) {
    board[i] = new Array<i32>(gridWidth);
    for (let j = 0; j < gridWidth; j++) {
        board[i][j] = 0;
    }
}

  return board;
}

let grid = newBoard();

let randomString = "0001010101100110011010110000101011000101111001010101110001000010000001100000001010110000010011101100110000101111010101101101011100101100000110001100100001111011010010111111010110011110010100100100110000011011110100011010100001111111101111101011000100011011";



//TODO : fix math.random ...
function updateGrid(): Chessboard {
  // just use a pseudo random number here, fixed for now 
  let newGrid: Chessboard = newBoard();
  for (let x = 0; x < gridWidth; x++) {
      for (let y = 0; y < gridHeight; y++) {
          let neighbors = calculateNeighbors(x, y);
          if (grid[x][y] === 1) {
              newGrid[x][y] = neighbors < 2 || neighbors > 3 ? 0 : 1;
          } else if (grid[x][y] === 2) {
              newGrid[x][y] = neighbors < 2 || neighbors > 3 ? 0 : 2;
          } else{
              if (neighbors === 3) {
              newGrid[x][y] = randomString.charAt(16*x+y) == "0" ? 1 : 2;
          }
        }

      }
  }
  return newGrid;
}
//&& Math.random() < 0.5

function calculateNeighbors(x: i32, y: i32): i32 {
  let count: i32 = 0;
  
  //for (let i = Math.max(0, x - 1); i <= Math.min(gridWidth - 1, x + 1); i++) 
  //     for (let j = Math.max(0, y - 1); j <= Math.min(gridHeight - 1, y + 1); j++)
  //have to avoid using math.max and math.min
  for (let i = ( (0 > (x-1)) ? 0 : (x - 1)); i <= ( (gridWidth - 1) < (x + 1) ? (gridWidth -1) : (x+1) ); i++){
      for (let j = ( (0 > (y - 1)) ? 0 : (y - 1)); j <= ( (gridHeight - 1) < (y + 1) ? (gridHeight - 1) : (y + 1)); j++) {
          

          count +=grid[i][j];
        
          
      }
  }
  return count - grid[x][y];
}

function selectWinner(): i32 {
  let redCount: u8 = 0;
  let blueCount: u8 = 0;
  for (let i = 0; i < gridWidth; i++) {
      for (let j = 0; j < gridHeight; j++) {
          if (grid[i][j] === 1) {
              redCount += 1;
          } else if (grid[i][j] === 2) {
              blueCount += 1;
          }
      }
  }

  if (blueCount > redCount) {
      return 2;
  } else if (redCount > blueCount) {
      return 1;
  } else {
      return 0;
  }
}


export function printTable(table: i32[][]): void {
  for (let i = 0; i < table.length; i++) {
    let row = "";
    for (let j = 0; j < table[i].length; j++) {
      row += table[i][j].toString() + "\t";
    }
    //console.log(row);
  }
}


export function handleBlocks(blocks: Block[]): Bytes {
  // init output state

  // #1 can access all (matched) events of the latest block
  let events: Event[] = blocks[0].events;

//  5176439
  // require match event count > 0


  // // this 2 way to access event are equal effects, alway true when there's only 1 event matched in the block (e.g. block# 2279547 on sepolia).
  // console.log("test start here");
  // let a  = BigInt.fromString("12259964418271227259165020387867311922165661543050510336");
  // let b = BigInt.fromString("49041447421489859511525162441559008579159965201382506496");


  // console.log(BigInt.fromI32(00213221312).toHexString());

  let player1Init = BigInt.fromBytes(events[0].data.slice(0, 32));
 // console.log(player1Init.toString());
  let player2Init= BigInt.fromBytes(events[0].data.slice(32, 64));
  let step = BigInt.fromBytes(events[0].data.slice(64, 96)).toI32();
  //to delete
  

  grid = intToChessboard(player1Init, player2Init);
  let ret = ByteArray.empty();
  let updatedBytes = chessboardToInt(grid);
  let player1Updated = updatedBytes.player1IntBytes;
  let player2Updated = updatedBytes.player2IntBytes;
  ret = ret.concat(player1Updated).concat(player2Updated);



  // console.log("start here");
  // let chessboard = intToChessboard(player1Init, player2Init);
  // //printTable(chessboard);
  // console.log(chessboard.toString());

  // let ints = chessboardToInt(chessboard);
  // console.log(ints.player1IntBytes.toString());
  // console.log(ints.player2IntBytes.toString());




  
  for(let i = 0; i < step; i++){
    grid = updateGrid();
    //console.log(step.toString());
    updatedBytes = chessboardToInt(grid);
    player1Updated = updatedBytes.player1IntBytes;
    player2Updated = updatedBytes.player2IntBytes;

    ret = ret.concat(player1Updated).concat(player2Updated);
    console.log("-----------------------")
     printTable(grid);    

  }

  
  // console.log("this should be mutp of 8 "+ret.length.toString());

    let winner = selectWinner();
    let winnerBytes = ByteArray.fromI32(winner);
    ret = ret.concat(winnerBytes); // last one byte is winner

    
   

  
  // set state to the address of the 1st (matched) event, demo purpose only.
  
  // Bytes.fromHexString()
  // return Bytes.empty();


  return Bytes.fromByteArray(ret);
}
