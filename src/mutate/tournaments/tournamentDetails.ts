import { addNotice } from '@Global/state/globalState';
import { addNotes } from '../base/addRemoveNotes';

// constants
import { MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import { MODIFY_TOURNAMENT_DETAIL } from '@Constants/topicConstants';
import { SUCCESS } from '@Constants/resultConstants';

export function setTournamentName({ tournamentRecord, promotionalName, tournamentName, formalName }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const tournamentId = tournamentRecord.tournamentId;

  const detailUpdates: any = { tournamentId };

  if (tournamentName && tournamentName !== tournamentRecord.tournamentName) {
    tournamentRecord.tournamentName = tournamentName;
    detailUpdates.tournamentName = tournamentName;
  }
  if (promotionalName && promotionalName !== tournamentRecord.promotionalName) {
    tournamentRecord.promotionalName = promotionalName;
    detailUpdates.promotionalName = promotionalName;
  }
  if (formalName && formalName !== tournamentRecord.formalName) {
    tournamentRecord.formalName = formalName;
    detailUpdates.formalName = formalName;
  }
  if (tournamentRecord.promotionalName === tournamentRecord.tournamentName) {
    delete tournamentRecord.promotionalName;
    detailUpdates.promotionalName = '';
  }
  if (tournamentRecord.formalName === tournamentRecord.tournamentName) {
    delete tournamentRecord.formalName;
    detailUpdates.formalName = '';
  }

  if (Object.keys(detailUpdates).length > 1) {
    addNotice({ topic: MODIFY_TOURNAMENT_DETAIL, payload: { tournamentId, ...detailUpdates } });
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
