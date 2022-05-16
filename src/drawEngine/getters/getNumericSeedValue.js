export function getNumericSeedValue(seedValue) {
  const numericSeedValue =
    seedValue && typeof seedValue === 'string'
      ? parseInt(seedValue.split('-')[0])
      : seedValue;
  if (isNaN(numericSeedValue)) console.log(numericSeedValue);
  return numericSeedValue;
}
