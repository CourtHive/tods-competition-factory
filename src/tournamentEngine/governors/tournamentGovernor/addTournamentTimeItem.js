import {
  INVALID_TIME_ITEM,
  MATCHUP_NOT_FOUND,
  MISSING_TIME_ITEM,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function addTournamentTimeItem({ tournamentRecord, timeItem }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!timeItem) return { error: MISSING_TIME_ITEM };

  const timeItemAttributes = timeItem && Object.keys(timeItem);
  const requiredAttributes = ['itemType', 'itemValue'];
  const validTimeItem =
    requiredAttributes.filter(attribute =>
      timeItemAttributes.includes(attribute)
    ).length === requiredAttributes.length;

  if (!validTimeItem) return { error: INVALID_TIME_ITEM };

  if (!tournamentRecord.timeItems) tournamentRecord.timeItems = [];
  const createdAt = new Date().toISOString();
  Object.assign(timeItem, { createdAt });
  tournamentRecord.timeItems.push(timeItem);

  return SUCCESS;
}

export function resetTournamentTimeItems({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  tournamentRecord.timeItems = [];
  return SUCCESS;
}
