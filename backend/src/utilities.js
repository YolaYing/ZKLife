"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intToChessboard = exports.chessboardToInt = exports.playerInts = void 0;
var zkgraph_lib_1 = require("@hyperoracle/zkgraph-lib");
var playerInts = /** @class */ (function () {
    function playerInts() {
        this.player1Int = zkgraph_lib_1.BigInt.fromI32(0);
        this.player2Int = zkgraph_lib_1.BigInt.fromI32(0);
    }
    return playerInts;
}());
exports.playerInts = playerInts;
function chessboardToInt(chessboard) {
    var ret = new playerInts();
    ret.player1Int = zkgraph_lib_1.BigInt.fromI32(0);
    ret.player2Int = zkgraph_lib_1.BigInt.fromI32(0);
    for (var i = 0; i < 16; i++) {
        for (var j = 0; j < 16; j++) {
            var bitIndex = i * 16 + j;
            if (chessboard[i][j] === 1) {
                ret.player1Int = ret.player1Int.bitOr(zkgraph_lib_1.BigInt.fromI32(1).leftShift(bitIndex));
            }
            else if (chessboard[i][j] === 2) {
                ret.player2Int = ret.player2Int.bitOr(zkgraph_lib_1.BigInt.fromI32(1).leftShift(bitIndex));
            }
        }
    }
    //return player1Int;
    return ret;
}
exports.chessboardToInt = chessboardToInt;
function intToChessboard(player1Int, player2Int) {
    var chessboard = [];
    for (var i = 0; i < 16; i++) {
        chessboard.push([]);
        for (var j = 0; j < 16; j++) {
            var bitIndex = i * 16 + j;
            var player1Bit = (player1Int.leftShift(bitIndex).bitAnd(zkgraph_lib_1.BigInt.fromI32(1))).toI32();
            var player2Bit = (player2Int.leftShift(bitIndex).bitAnd(zkgraph_lib_1.BigInt.fromI32(1))).toI32();
            var bitValue = player1Bit === 1 ? 1 : (player2Bit === 1 ? 2 : 0);
            chessboard[i].push(bitValue);
        }
    }
    return chessboard;
}
exports.intToChessboard = intToChessboard;
var a = zkgraph_lib_1.BigInt.fromString("12259964418271227259165020387867311922165661543050510336");
var b = zkgraph_lib_1.BigInt.fromString("49041447421489859511525162441559008579159965201382506496");
var chessboard = intToChessboard(a, b);
