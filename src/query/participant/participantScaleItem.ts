import { getAccessorValue } from '../../tools/getAccessorValue';

import type { Participant, EventTypeUnion } from '../../types/tournamentTypes';
import { ScaleAttributes, ScaleItem } from '../../types/factoryTypes';
import { ResultType } from '../../global/functions/decorateResult';
import { SUCCESS } from '../../constants/resultConstants';
import { SCALE } from '../../constants/scaleConstants';
import { isObject } from '../../tools/objects';
import { INVALID_SCALE_ITEM, INVALID_VALUES, MISSING_PARTICIPANT } from '../../constants/errorConditionConstants';

export interface ParticipantScaleItemArgs {
  scaleAttributes: ScaleAttributes;
  requireTimeStamp?: boolean;
  participant: Participant;
}

export function participantScaleItem({
  requireTimeStamp,
  scaleAttributes,
  participant,
}: ParticipantScaleItemArgs): ResultType & { scaleItem?: ScaleItem } {
  if (!participant) return { error: MISSING_PARTICIPANT };
  if (!isObject(scaleAttributes)) return { error: INVALID_VALUES };

  if (!participant.timeItems) participant.timeItems = [];
  if (Array.isArray(participant.timeItems)) {
    const { accessor, scaleType, eventType, scaleName } = scaleAttributes;
    const filterType = [SCALE, scaleType, eventType, scaleName].join('.');
    const filteredTimeItems = participant.timeItems
      .filter((timeItem) => timeItem?.itemType === filterType)
      .filter((timeItem) => !requireTimeStamp || timeItem?.itemDate)
      .sort(
        (a, b) =>
          (a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0),
      );

    const timeItem = filteredTimeItems.pop();

    if (timeItem) {
      const [itemSubject, scaleType, eventType, scaleName] = timeItem.itemType?.split('.') ?? [];

      if (itemSubject !== SCALE) return { error: INVALID_SCALE_ITEM };

      const accessorValue: any = accessor && getAccessorValue({ element: timeItem.itemValue, accessor });
      const scaleValue = accessorValue?.value || timeItem.itemValue;

      const scaleItem = {
        eventType: eventType as EventTypeUnion,
        scaleDate: timeItem.itemDate,
        scaleValue,
        scaleName,
        scaleType,
      };
      return { ...SUCCESS, scaleItem };
    }
  }

  return { ...SUCCESS, scaleItem: undefined };
}
