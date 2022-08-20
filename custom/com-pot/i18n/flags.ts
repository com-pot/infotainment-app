/**
 * Maps country code to region symbol utf-8 symbols
 * 
 * The region symbol combos are rendered as a flag if supported by browser, otherwise
 * they are rendered as letters.
 * 
 * @param countryCode eg.: 'en', 'cs', ...
 * @returns 
 */
export function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char =>  127397 + char.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
  }