import { getAccessorValue } from '../../utilities/getAccessorValue';

import { ScaleAttributes, ScaleItem } from '../../types/factoryTypes';
import type { Participant, TypeEnum } from '../../types/tournamentFromSchema';
import { SCALE } from '../../constants/scaleConstants';
import {
  ErrorType,
  INVALID_SCALE_ITEM,
  INVALID_VALUES,
  MISSING_PARTICIPANT,
  SCALE_ITEM_NOT_FOUND,
} from '../../constants/errorConditionConstants';

export interface ParticipantScaleItemArgs {
  scaleAttributes: ScaleAttributes;
  requireTimeStamp?: boolean;
  participant: Participant;
}

export function participantScaleItem({
  requireTimeStamp,
  scaleAttributes,
  participant,
}: ParticipantScaleItemArgs): {
  scaleItem?: ScaleItem;
  error?: ErrorType;
} {
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
          (a.createdAt ? new Date(a.createdAt).getTime() : 0) -
          (b.createdAt ? new Date(b.createdAt).getTime() : 0)
      );

    const timeItem = filteredTimeItems.pop();

    if (timeItem) {
      const [itemSubject, scaleType, eventType, scaleName] =
        timeItem.itemType?.split('.') ?? [];

      if (itemSubject !== SCALE) return { error: INVALID_SCALE_ITEM };

      const accessorValue: any =
        accessor && getAccessorValue({ element: timeItem.itemValue, accessor });
      const scaleValue = accessorValue?.value || timeItem.itemValue;

      const scaleItem = {
        eventType: eventType as TypeEnum,
        scaleDate: timeItem.itemDate,
        scaleValue,
        scaleName,
        scaleType,
      };
      return { scaleItem };
    } else {
      return { error: SCALE_ITEM_NOT_FOUND };
    }
  }

  return { error: MISSING_PARTICIPANT };
}
