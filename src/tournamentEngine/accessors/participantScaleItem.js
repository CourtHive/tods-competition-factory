import { getAccessorValue } from '../../utilities/getAccessorValue';
import {
  INVALID_SCALE_ITEM,
  INVALID_VALUES,
  MISSING_PARTICIPANT,
  SCALE_ITEM_NOT_FOUND,
} from '../../constants/errorConditionConstants';
import { SCALE } from '../../constants/scaleConstants';

export function participantScaleItem({
  participant,
  scaleAttributes,
  requireTimeStamp,
}) {
  if (!participant) return { error: MISSING_PARTICIPANT };
  if (typeof scaleAttributes !== 'object') return { error: INVALID_VALUES };

  if (!participant.timeItems) participant.timeItems = [];
  if (participant && Array.isArray(participant.timeItems)) {
    const { accessor, scaleType, eventType, scaleName } = scaleAttributes;
    const filterType = [SCALE, scaleType, eventType, scaleName].join('.');
    const filteredTimeItems = participant.timeItems
      .filter((timeItem) => timeItem?.itemType === filterType)
      .filter((timeItem) => !requireTimeStamp || timeItem?.itemDate)
      .sort(
        (a, b) =>
          new Date(a.createdAt || undefined) -
          new Date(b.createdAt || undefined)
      );

    const timeItem = filteredTimeItems.pop();

    if (timeItem) {
      const [itemSubject, scaleType, eventType, scaleName] =
        timeItem.itemType.split('.');

      if (itemSubject !== SCALE) return { error: INVALID_SCALE_ITEM };

      const accessorValue =
        accessor && getAccessorValue({ element: timeItem.itemValue, accessor });
      const scaleValue = accessor ? accessorValue.value : timeItem.itemValue;

      const scaleItem = {
        scaleDate: timeItem.itemDate,
        scaleName,
        scaleType,
        eventType,
        scaleValue,
      };
      return { scaleItem };
    } else {
      return { error: SCALE_ITEM_NOT_FOUND };
    }
  }

  return { error: MISSING_PARTICIPANT };
}
