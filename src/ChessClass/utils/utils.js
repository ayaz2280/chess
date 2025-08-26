"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.range = range;
exports.styled = styled;
exports.isDigit = isDigit;
exports.getUniqueArray = getUniqueArray;
exports.inRange = inRange;
function range(startInclusive, endInclusive) {
    var range = [];
    for (var i = startInclusive; i <= endInclusive; i++) {
        range.push(i);
    }
    return range;
}
function styled(s, styleCode) {
    return "\u001B[".concat(styleCode, "m").concat(s, "\u001B[0m");
}
function isDigit(num) {
    return num >= '0' && num <= '9';
}
function getUniqueArray(arr) {
    return __spreadArray([], new Set(arr), true);
}
function inRange(value, start, end) {
    if (start > end)
        return false;
    return value >= start && value <= end;
}
