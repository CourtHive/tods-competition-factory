import {
  MISSING_PARTICIPANT,
  SCALE_ITEM_NOT_FOUND,
} from '../../constants/errorConditionConstants';
import { SCALE } from '../../constants/scaleConstants';

export function participantScaleItem({
  participant,
  scaleAttributes,
  requireTimeStamp,
}) {
  if (!participant.timeItems) participant.timeItems = [];
  if (participant && Array.isArray(participant.timeItems)) {
    const timeItem = participant.timeItems
      .filter((timeItem) => timeItem.itemSubject === SCALE)
      .filter(
        (timeItem) =>
          !scaleAttributes.scaleType ||
          timeItem.itemType === scaleAttributes.scaleType
      )
      .filter(
        (timeItem) =>
          !scaleAttributes.eventType ||
          timeItem.itemSubType === scaleAttributes.eventType
      )
      .filter((timeItem) => requireTimeStamp === false || timeItem.createdAt)
      .sort(
        (a, b) =>
          new Date(a.createdAt || undefined) -
          new Date(b.createdAt || undefined)
      )
      .reduce((scaleValue, candidate) => {
        return (candidate.itemName === scaleAttributes.scaleName &&
          (!scaleAttributes.scaleType ||
            candidate.itemType === scaleAttributes.scaleType) &&
          (!scaleAttributes.scaleClass ||
            candidate.itemSubType === scaleAttributes.scaleClass)) ||
          (candidate.itemId &&
            scaleAttributes.scaleId &&
            candidate.itemId === scaleAttributes.scaleId)
          ? candidate
          : scaleValue;
      }, undefined);

    if (timeItem) {
      const scaleItem = {
        scaleDate: timeItem.itemDate,
        scaleName: timeItem.itemName,
        scaleType: timeItem.itemType,
        eventType: timeItem.itemSubType,
        scaleValue: timeItem.itemValue,
      };
      return { scaleItem };
    } else {
      return { error: SCALE_ITEM_NOT_FOUND };
    }
  }

  return { error: MISSING_PARTICIPANT };
}
