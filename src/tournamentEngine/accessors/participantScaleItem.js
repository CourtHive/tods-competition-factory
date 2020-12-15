import {
  INVALID_SCALE_ITEM,
  MISSING_PARTICIPANT,
  SCALE_ITEM_NOT_FOUND,
} from '../../constants/errorConditionConstants';

export function participantScaleItem({
  participant,
  scaleAttributes,
  requireTimeStamp,
}) {
  if (!participant.timeItems) participant.timeItems = [];
  if (participant && Array.isArray(participant.timeItems)) {
    const { scaleType, eventType, scaleName } = scaleAttributes;
    const filterType = ['SCALE', scaleType, eventType, scaleName].join('.');
    const filteredTimeItems = participant.timeItems
      .filter((timeItem) => timeItem.itemType === filterType)
      .filter((timeItem) => requireTimeStamp === false || timeItem.itemDate)
      .sort(
        (a, b) =>
          new Date(a.createdAt || undefined) -
          new Date(b.createdAt || undefined)
      );
    const timeItem = filteredTimeItems.reduce((scaleValue, candidate) => {
      // this can be greatly simplified... we are just going to return the last matching item
      // so sort such that popping will remove last
      return candidate.itemType === filterType ? candidate : scaleValue;
    }, undefined);

    if (timeItem) {
      const [
        itemSubject,
        scaleType,
        eventType,
        scaleName,
      ] = timeItem.itemType.split('.');
      if (itemSubject !== 'SCALE') return { error: INVALID_SCALE_ITEM };

      const scaleItem = {
        scaleDate: timeItem.itemDate,
        scaleName,
        scaleType,
        eventType,
        scaleValue: timeItem.itemValue,
      };
      return { scaleItem };
    } else {
      return { error: SCALE_ITEM_NOT_FOUND };
    }
  }

  return { error: MISSING_PARTICIPANT };
}
