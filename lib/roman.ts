const NUMERALS: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
]

/** Section numbering, operator's-manual style: 1 → I, 4 → IV. */
export function toRoman(value: number) {
  let rest = Math.floor(value)
  if (rest < 1 || rest > 3999) return String(value)
  let out = ''
  for (const [amount, numeral] of NUMERALS) {
    while (rest >= amount) {
      out += numeral
      rest -= amount
    }
  }
  return out
}
