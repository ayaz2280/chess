"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeMasks = writeMasks;
exports.readMasks = readMasks;
var fs_1 = require("fs");
function writeMasks(path, masks) {
    var masksArr = new BigUint64Array(masks);
    return fs_1.promises.writeFile(path, masksArr)
        .then(function () {
        console.log("Successfully written ".concat(masksArr.byteLength, " bytes to file ").concat(path));
    });
}
function readMasks(path) {
    return fs_1.promises.readFile(path)
        .then(function (fileBuffer) {
        var masksArr = new BigUint64Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.length / 8);
        var masks = Array.from(masksArr);
        if (masks.length !== 64) {
            throw new RangeError("Number of masks isn't equal 64. Got ".concat(masks.length));
        }
        console.log("Successfully read ".concat(masksArr.length, " bytes from file ").concat(path));
        return masks;
    });
}
