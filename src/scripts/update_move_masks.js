"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var BishopMoveMasks_1 = require("../ChessClass/MovesBB/MoveMasksGenerators/BishopMoveMasks");
var KingMoveMasks_1 = require("../ChessClass/MovesBB/MoveMasksGenerators/KingMoveMasks");
var KnightMoveMasks_1 = require("../ChessClass/MovesBB/MoveMasksGenerators/KnightMoveMasks");
var PawnMoveMasks_1 = require("../ChessClass/MovesBB/MoveMasksGenerators/PawnMoveMasks");
var QueenMoveMasks_1 = require("../ChessClass/MovesBB/MoveMasksGenerators/QueenMoveMasks");
var RookMoveMasks_1 = require("../ChessClass/MovesBB/MoveMasksGenerators/RookMoveMasks");
var MoveMasksFilesFunctions_1 = require("../ChessClass/MovesBB/MoveMasksFiles/MoveMasksFilesFunctions");
var BASE_PATH = "C:/Users/ffajl/OneDrive/\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B/GitHub/untitled8/chess/src/ChessClass/MovesBB/MoveMasksFiles";
var pieceMaskMap = {
    'pawn': {
        'move': PawnMoveMasks_1.PAWN_PUSH_MASKS,
        'attack': PawnMoveMasks_1.PAWN_ATTACK_MASKS,
        'en_passant': PawnMoveMasks_1.PAWN_EN_PASSANT_FILE_MASKS,
    },
    'bishop': {
        'move': BishopMoveMasks_1.BISHOP_MOVE_MASKS,
    },
    'knight': {
        'move': KnightMoveMasks_1.KNIGHT_MOVE_MASKS,
    },
    'rook': {
        'move': RookMoveMasks_1.ROOK_MOVE_MASKS,
    },
    'queen': {
        'move': QueenMoveMasks_1.QUEEN_MOVE_MASKS,
    },
    'king': {
        'move': KingMoveMasks_1.KING_MOVE_MASKS
    }
};
function recalculateMasks() {
    (0, BishopMoveMasks_1.calculateBishopMoveMasks)();
    (0, KingMoveMasks_1.calculateKingMoveMasks)();
    (0, KnightMoveMasks_1.calculateKnightMoveMasks)();
    (0, PawnMoveMasks_1.calculatePawnAttackMasks)();
    (0, PawnMoveMasks_1.calculatePawnPushMasks)();
    (0, QueenMoveMasks_1.calculateQueenMoveMasks)();
    (0, RookMoveMasks_1.calculateRookMoveMasks)();
}
function updateMaskFiles() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c, _i, piece, dirName, _d, _e, _f, _g, moveMaskType, fileName, path, err_1;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    recalculateMasks();
                    _a = pieceMaskMap;
                    _b = [];
                    for (_c in _a)
                        _b.push(_c);
                    _i = 0;
                    _h.label = 1;
                case 1:
                    if (!(_i < _b.length)) return [3 /*break*/, 9];
                    _c = _b[_i];
                    if (!(_c in _a)) return [3 /*break*/, 8];
                    piece = _c;
                    dirName = "".concat(piece.charAt(0).concat(piece.substring(1)), "MasksFiles");
                    _d = pieceMaskMap[piece];
                    _e = [];
                    for (_f in _d)
                        _e.push(_f);
                    _g = 0;
                    _h.label = 2;
                case 2:
                    if (!(_g < _e.length)) return [3 /*break*/, 8];
                    _f = _e[_g];
                    if (!(_f in _d)) return [3 /*break*/, 7];
                    moveMaskType = _f;
                    fileName = "".concat(piece, "_").concat(moveMaskType, "_masks");
                    path = "".concat(BASE_PATH, "/").concat(dirName, "/").concat(fileName);
                    _h.label = 3;
                case 3:
                    _h.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, MoveMasksFilesFunctions_1.writeMasks)(path, pieceMaskMap[piece][moveMaskType])];
                case 4:
                    _h.sent();
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _h.sent();
                    console.error("Couldn't write data to file ".concat(path), err_1);
                    return [2 /*return*/];
                case 6:
                    ;
                    console.log("Generated ".concat(piece, " masks at location ").concat(path));
                    _h.label = 7;
                case 7:
                    _g++;
                    return [3 /*break*/, 2];
                case 8:
                    _i++;
                    return [3 /*break*/, 1];
                case 9: return [2 /*return*/];
            }
        });
    });
}
updateMaskFiles();
