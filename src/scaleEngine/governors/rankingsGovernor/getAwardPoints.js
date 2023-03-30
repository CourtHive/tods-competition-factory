import { isConvertableInteger } from '../../../utilities/math';
import { getTargetElement } from './getTargetElement';

export function getAwardPoints({ valueObj, drawSize, level, participantWon }) {
  const getValue = (obj) => {
    const value = obj?.value || obj?.v || (isConvertableInteger(obj) ? obj : 0);
    return getTargetElement(level, obj?.level) || value;
  };

  let awardPoints = 0;
  let requireWin;
  let s, t, d;

  const winAccessor =
    (participantWon && 'won') ||
    (participantWon === false && 'lost') ||
    undefined;

  if (Array.isArray(valueObj)) {
    let sizeDefined = valueObj.find(
      (obj) => obj.drawSize === drawSize || obj.drawSizes?.includes(drawSize)
    );

    // threshold attribute allows a definition for e.g. drawSize: 16 to apply to all LARGER drawSizes
    let thresholdMatched = valueObj.find(
      (obj) => obj.drawSize && obj.threshold && drawSize > obj.drawSize
    );
    // a default definition can be provided which has no drawSize or drawSizes
    let defaultDef = valueObj.find(
      (obj) => !obj.drawSize && !obj.drawSizes?.length
    );

    if (winAccessor !== undefined) {
      sizeDefined = sizeDefined?.[winAccessor];
      thresholdMatched = thresholdMatched?.[winAccessor];
      defaultDef = defaultDef?.[winAccessor];
    }
    s = getValue(sizeDefined);
    t = getValue(thresholdMatched);
    d = getValue(defaultDef);
    awardPoints = s || t || d;

    requireWin =
      (s && sizeDefined.requireWin) ||
      (t && thresholdMatched.requireWin) ||
      defaultDef?.requireWin;
  } else if (typeof valueObj === 'object') {
    let sizeDefined = valueObj?.drawSizes?.[drawSize];
    let defaultDef = valueObj;
    if (winAccessor !== undefined) {
      sizeDefined = sizeDefined?.[winAccessor];
      defaultDef = defaultDef?.[winAccessor];
    }
    s = getValue(sizeDefined);
    d = getValue(defaultDef);
    awardPoints = s || d;

    requireWin = s ? sizeDefined.requireWin : defaultDef?.requireWin;
  } else if (isConvertableInteger(valueObj)) {
    // when using participantWon non-objects are not valid
    if (winAccessor === undefined) awardPoints = valueObj;
  }

  return { awardPoints, requireWin };
}
