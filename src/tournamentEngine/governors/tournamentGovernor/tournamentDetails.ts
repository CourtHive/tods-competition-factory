import { addNotes } from './addRemoveNotes';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function setTournamentName({
  tournamentRecord,
  promotionalName,
  tournamentName,
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
  return { ...SUCCESS };
}

export function setTournamentNotes({ tournamentRecord, notes }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return addNotes({ element: tournamentRecord, notes });
}

export function setTournamentCategories({ tournamentRecord, categories }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  categories = (categories || []).filter((category) => {
    return category.categoryName && category.type;
  });
  tournamentRecord.tournamentCategories = categories;
  return { ...SUCCESS };
}
