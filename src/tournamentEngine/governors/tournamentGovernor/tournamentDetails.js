import { INVALID_DATE } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { dateValidation } from '../../../fixtures/validations/regex';

export function setTournamentName({
  tournamentRecord,
  name,
  promotionalName,
  formalName,
}) {
  if (name) tournamentRecord.name = name;
  if (promotionalName) tournamentRecord.promotionalName = promotionalName;
  if (formalName) tournamentRecord.formalName = formalName;
  if (tournamentRecord.promotionalName === tournamentRecord.name) {
    delete tournamentRecord.promotionalName;
  }
  if (tournamentRecord.formalName === tournamentRecord.name) {
    delete tournamentRecord.formalName;
  }
  return SUCCESS;
}

export function setTournamentNotes({ tournamentRecord, notes }) {
  tournamentRecord.notes = notes;
  return SUCCESS;
}

export function setTournamentStartDate({ tournamentRecord, startDate }) {
  if (!dateValidation.test(startDate)) return { error: INVALID_DATE };
  if (
    tournamentRecord.startDate &&
    new Date(startDate) > new Date(tournamentRecord.startDate)
  ) {
    console.log('TODO: check for events to be unscheduled');
  }
  tournamentRecord.startDate = startDate;
  return SUCCESS;
}

export function setTournamentEndDate({ tournamentRecord, endDate }) {
  if (!dateValidation.test(endDate)) return { error: INVALID_DATE };
  if (
    tournamentRecord.endDate &&
    new Date(endDate) < new Date(tournamentRecord.endDate)
  ) {
    console.log('TODO: check for events to be unscheduled');
  }
  tournamentRecord.endDate = endDate;
  return SUCCESS;
}

export function setTournamentCategories({ tournamentRecord, categories }) {
  categories = (categories || []).filter((category) => {
    return category.categoryName && category.type;
  });
  tournamentRecord.tournamentCategories = categories;
  return SUCCESS;
}
