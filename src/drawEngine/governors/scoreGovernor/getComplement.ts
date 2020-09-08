export const getSetComplement = (props) => {
  const { isSide1, lowValue, setTo, tiebreakAt } = props;
  let valueAsNumber = parseInt(lowValue);
  if (valueAsNumber?.toString().length > 2) {
    valueAsNumber = parseInt(valueAsNumber.toString().slice(0, 2));
  }

  if (tiebreakAt && tiebreakAt < setTo && valueAsNumber > tiebreakAt) {
    valueAsNumber = tiebreakAt;
  } 

  const calculatedValue = valueAsNumber + 1 < setTo ? setTo
    : (tiebreakAt < setTo && valueAsNumber === tiebreakAt) ? setTo
    : !tiebreakAt ? valueAsNumber + 2
    : setTo + 1;

  const side1Result = isSide1 ? valueAsNumber : calculatedValue;
  const side2Result = !isSide1 ? valueAsNumber : calculatedValue;

  return [side1Result, side2Result];
};

export const getTiebreakComplement = (props) => {
  const { isSide1, lowValue, tiebreakTo, tiebreakNoAd } = props;
  let valueAsNumber = parseInt(lowValue);

  // do not accept low values greater than two digits;
  if (valueAsNumber?.toString().length > 2) {
    valueAsNumber = parseInt(valueAsNumber.toString().slice(0, 2));
  }

  // If NOAD low lowValue cannot be greater than tiebreakTo - 1
  if (tiebreakNoAd && valueAsNumber > tiebreakTo - 1) {
    valueAsNumber = tiebreakTo - 1;
  }

  const highValue = getHighTiebreakValue({lowValue: valueAsNumber, NoAD: tiebreakNoAd, tiebreakTo });
  const side1Result = isSide1 ? valueAsNumber : highValue;
  const side2Result = !isSide1 ? valueAsNumber : highValue;
  return [side1Result, side2Result];
};

function getHighTiebreakValue(props) {
  const { lowValue, NoAD, tiebreakTo } = props;
  const winBy = NoAD ? 1 : 2;
  if (lowValue + 1 >= tiebreakTo) { return lowValue + winBy; }
  return tiebreakTo;
}
