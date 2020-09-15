import { SUCCESS } from '../../../constants/resultConstants';

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

// TODO: add validation to check if date is valid
export function setTournamentStartDate({ tournamentRecord, startDate }) {
  if (
    tournamentRecord.startDate &&
    new Date(startDate) > new Date(tournamentRecord.startDate)
  ) {
    console.log('TODO: check for events to be unscheduled');
  }
  tournamentRecord.startDate = startDate;
  return SUCCESS;
}

// TODO: add validation to check if date is valid
export function setTournamentEndDate({ tournamentRecord, endDate }) {
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
  categories = (categories || []).filter(category => {
    return category.categoryName && category.type;
  });
  tournamentRecord.tournamentCategories = categories;
  return SUCCESS;
}
