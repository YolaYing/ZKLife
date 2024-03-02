import { BigInt ,ByteArray} from "@hyperoracle/zkgraph-lib";
export type Chessboard = i32[][];

export class playerInts {
    player1Int: BigInt;
    player2Int: BigInt;
    constructor() {
        this.player1Int = BigInt.fromI32(0);
        this.player2Int = BigInt.fromI32(0);
    }
}

export class playerBytes {
    player1IntBytes: ByteArray;
    player2IntBytes: ByteArray;
    constructor() {
        this.player1IntBytes = ByteArray.empty();
        this.player2IntBytes = ByteArray.empty();
    }
}

export function chessboardToInt(chessboard: Chessboard): playerBytes {
    let ret = new playerInts();
    let retBytes = new playerBytes();
    ret.player1Int = BigInt.fromI32(0);
    ret.player2Int = BigInt.fromI32(0);

    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            const bitIndex = i * 16 + j;

            if (chessboard[i][j] === 1) {
                ret.player1Int = ret.player1Int.bitOr(BigInt.fromI32(1).leftShift(bitIndex));
            } else if (chessboard[i][j] === 2) {
                ret.player2Int = ret.player2Int.bitOr(BigInt.fromI32(1).leftShift(bitIndex));
            }
        }

    }
    //return player1Int;

    let b1 = ByteArray.fromHexString(ret.player1Int.toHexString());
    let b2 = ByteArray.fromHexString(ret.player2Int.toHexString());
    let paddingLen1 = 32 - b1.length;
    let paddingLen2 = 32 - b2.length;
    for (let i = 0; i < paddingLen1; i++) {
        b1 = ByteArray.fromHexString("00").concat(b1);
    }
    for (let i = 0; i < paddingLen2; i++) {
        b2 = ByteArray.fromHexString("00").concat(b2);
    }
    // console.log(b1.toString());
    // console.log(b2.toString());
    // console.log("this is b1 len" + b1.length.toString());
    // console.log("this is b2 len" + b2.length.toString());

    retBytes.player1IntBytes = b1;
    retBytes.player2IntBytes = b2;
    return retBytes;
}


export function intToChessboard(player1Int: BigInt, player2Int: BigInt): Chessboard {
  const chessboard: Chessboard = [];

  for (let i = 0; i < 16; i++) {
      chessboard.push([]);
      for (let j = 0; j < 16; j++) {
          const bitIndex = i * 16 + j;

          const player1Bit = (player1Int.rightShift(bitIndex).bitAnd(BigInt.fromI32(1))).toI32();
          const player2Bit = (player2Int.rightShift(bitIndex).bitAnd(BigInt.fromI32(1))).toI32();

          const bitValue = player1Bit === 1 ? 1 : (player2Bit === 1 ? 2 : 0);

          chessboard[i].push(bitValue);
      }
  }

  return chessboard;
}



