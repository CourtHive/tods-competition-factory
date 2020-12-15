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
    /*
    const {itemSubject, scaleType, eventType} = scaleAttributes;
    const filterType = [itemSubject, scaleType, eventType, scaleName].join('.');
    */
    const timeItem = participant.timeItems
      // .filter((timeItem) => timeItem.itemType === filterType)
      .filter((timeItem) => timeItem.itemSubject === SCALE)
      .filter(
        (timeItem) =>
          !scaleAttributes.scaleType ||
          timeItem.itemType === scaleAttributes.scaleType
      )
      .filter(
        (timeItem) =>
          !scaleAttributes.eventType ||
          timeItem.itemSubTypes?.includes(scaleAttributes.eventType)
      )
      .filter((timeItem) => requireTimeStamp === false || timeItem.createdAt)
      .sort(
        (a, b) =>
          new Date(a.createdAt || undefined) -
          new Date(b.createdAt || undefined)
      )
      .reduce((scaleValue, candidate) => {
        /*
        // this can be greatly simplified... we are just going to return the last matching item
        return candidate.itemType === filterType ? candidate : scaleValue;
        */
        return candidate.itemName === scaleAttributes.scaleName &&
          (!scaleAttributes.scaleType ||
            candidate.itemType === scaleAttributes.scaleType) &&
          (!scaleAttributes.scaleClass ||
            candidate.itemSubTypes?.includes(scaleAttributes.scaleClass))
          ? candidate
          : scaleValue;
      }, undefined);

    if (timeItem) {
      // 'SCALE.RANKING.SINGLES.U18'
      // 'SCALE.RATING.SINGLES.WTN'
      /*
      const [itemSubject, scaleType, eventType, scaleName] = itemType.split('.');
      const scaleItem = {
        scaleDate: timeItem.itemDate,
        scaleName,
        scaleType,
        eventType,
        scaleValue: timeItem.itemValue,
      };
      */
      const scaleItem = {
        scaleDate: timeItem.itemDate,
        scaleName: timeItem.itemName,
        scaleType: timeItem.itemType,
        eventType: timeItem.itemSubTypes[0],
        scaleValue: timeItem.itemValue,
      };
      return { scaleItem };
    } else {
      return { error: SCALE_ITEM_NOT_FOUND };
    }
  }

  return { error: MISSING_PARTICIPANT };
}
