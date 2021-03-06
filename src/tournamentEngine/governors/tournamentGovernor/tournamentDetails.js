import { dateValidation } from '../../../fixtures/validations/regex';
import { addNotes } from './addRemoveNotes';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_DATE,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function setTournamentName({
  tournamentRecord,
  tournamentName,
  promotionalName,
  formalName,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (tournamentName) tournamentRecord.tournamentName = tournamentName;
  if (promotionalName) tournamentRecord.promotionalName = promotionalName;
  if (formalName) tournamentRecord.formalName = formalName;
  if (tournamentRecord.promotionalName === tournamentRecord.tournamentName) {
    delete tournamentRecord.promotionalName;
  }
  if (tournamentRecord.formalName === tournamentRecord.tournamentName) {
    delete tournamentRecord.formalName;
  }
  return SUCCESS;
}

export function setTournamentNotes({ tournamentRecord, notes }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return addNotes({ element: tournamentRecord, notes });
}

// TODO: check for matchUps that must be unscheduled with change in date
// TODO: check all courts in all venues for dateAvailability that is outside of tournament date range
export function setTournamentStartDate({ tournamentRecord, startDate }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!dateValidation.test(startDate)) return { error: INVALID_DATE };
  if (
    tournamentRecord.startDate &&
    new Date(startDate) > new Date(tournamentRecord.startDate)
  ) {
    // console.log('TODO: check for events to be unscheduled');
  }

  if (
    tournamentRecord.endDate &&
    new Date(startDate) > new Date(tournamentRecord.endDate)
  ) {
    tournamentRecord.endDate = startDate;
  }
  tournamentRecord.startDate = startDate;
  return SUCCESS;
}

// TODO: check for matchUps that must be unscheduled with change in date
// TODO: check all courts in all venues for dateAvailability that is outside of tournament date range
export function setTournamentEndDate({ tournamentRecord, endDate }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!dateValidation.test(endDate)) return { error: INVALID_DATE };
  if (
    tournamentRecord.endDate &&
    new Date(endDate) < new Date(tournamentRecord.endDate)
  ) {
    // console.log('TODO: check for events to be unscheduled');
  }
  if (
    tournamentRecord.startDate &&
    new Date(endDate) < new Date(tournamentRecord.startDate)
  ) {
    tournamentRecord.startDate = endDate;
  }
  tournamentRecord.endDate = endDate;
  return SUCCESS;
}

export function setTournamentCategories({ tournamentRecord, categories }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  categories = (categories || []).filter((category) => {
    return category.categoryName && category.type;
  });
  tournamentRecord.tournamentCategories = categories;
  return SUCCESS;
}
