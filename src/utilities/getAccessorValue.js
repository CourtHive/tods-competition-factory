import { makeDeepCopy } from './makeDeepCopy';

export function getAccessorValue({ element, accessor }) {
  if (typeof accessor !== 'string') return { values: [] };
  const targetElement = makeDeepCopy(element);
  const attributes = accessor.split('.');

  let value,
    values = [];
  processKeys({ targetElement, attributes });

  const result = { value };
  if (values.length) result.values = values;
  return result;

  function processKeys({
    targetElement,
    attributes = [],
    significantCharacters,
  }) {
    for (const [index, attribute] of attributes.entries()) {
      if (targetElement && targetElement[attribute]) {
        if (Array.isArray(targetElement[attribute])) {
          const values = targetElement[attribute];
          const remainingKeys = attributes.slice(index);
          values.forEach((nestedTarget) =>
            processKeys({
              targetElement: nestedTarget,
              attributes: remainingKeys,
            })
          );
        } else {
          targetElement = targetElement[attribute];
          checkValue({ targetElement, index });
        }
      }
    }

    function checkValue({ targetElement, index }) {
      if (
        targetElement &&
        index === attributes.length - 1 &&
        ['string', 'number'].includes(typeof targetElement)
      ) {
        const extractedValue = significantCharacters
          ? targetElement.slice(0, significantCharacters)
          : targetElement;
        if (value) {
          if (!values.includes(extractedValue)) {
            values.push(extractedValue);
          }
        } else {
          value = extractedValue;
          values.push(extractedValue);
        }
      }
    }
  }
}
