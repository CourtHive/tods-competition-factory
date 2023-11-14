type ProcessKeys = {
  significantCharacters?: number;
  accessors: string[];
  value: any;
};
export function processAccessors({
  significantCharacters,
  accessors = [],
  value,
}: ProcessKeys) {
  const extractedValues: string[] = [];
  const accessor = accessors[0];
  if (value?.[accessor]) {
    if (Array.isArray(value[accessor])) {
      const values = value[accessor];
      const remainingAccessors = accessors.slice(1);
      values.forEach((nestedValue) => {
        const extracted = processAccessors({
          accessors: remainingAccessors,
          significantCharacters,
          value: nestedValue,
        });
        extractedValues.push(...extracted);
        return extracted;
      });
    } else {
      value = value[accessor];
      checkValue({ value });
    }
  }

  function checkValue({ value }) {
    if (value && ['string', 'number'].includes(typeof value)) {
      const extractedValue = significantCharacters
        ? value.slice(0, significantCharacters)
        : value;
      extractedValues.push(extractedValue);
    }
  }

  return extractedValues;
}
