"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.range = range;
exports.styled = styled;
exports.isDigit = isDigit;
exports.getUniqueArray = getUniqueArray;
exports.inRange = inRange;
function range(startInclusive, endInclusive) {
    const range = [];
    for (let i = startInclusive; i <= endInclusive; i++) {
        range.push(i);
    }
    return range;
}
function styled(s, styleCode) {
    return `\x1b[${styleCode}m${s}\x1b[0m`;
}
function isDigit(num) {
    return num >= '0' && num <= '9';
}
function getUniqueArray(arr) {
    return [...new Set(arr)];
}
function inRange(value, start, end) {
    if (start > end)
        return false;
    return value >= start && value <= end;
}
//# sourceMappingURL=utils.js.map