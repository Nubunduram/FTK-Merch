// src/utils/sizes.js
export const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

export const sortSizes = (sizes, getKey = item => item) => {
  return [...sizes].sort((a, b) => {
    const keyA = getKey(a);
    const keyB = getKey(b);

    const iA = SIZE_ORDER.indexOf(keyA);
    const iB = SIZE_ORDER.indexOf(keyB);
    if (iA !== -1 && iB !== -1) return iA - iB;

    const numA = parseFloat(keyA);
    const numB = parseFloat(keyB);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;

    return keyA.localeCompare(keyB);
  });
};