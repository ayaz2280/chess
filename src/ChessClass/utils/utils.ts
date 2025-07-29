function range(startInclusive: number, endInclusive: number): number[] {
  const range: number[] = [];

  for (let i = startInclusive; i <= endInclusive; i++) {
    range.push(i);
  }

  return range;
}

function styled(s: string, styleCode: number): string {
  return `\x1b[${styleCode}m${s}\x1b[0m`;
}
function isDigit(num: string): boolean {
  return num >= '0' && num <= '9';
}
function getUniqueArray<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}


export { range, styled, isDigit, getUniqueArray };
export function inRange(value: number, start: number, end: number): boolean {
    if (start > end) return false;
    return value >= start && value <= end;
  }
