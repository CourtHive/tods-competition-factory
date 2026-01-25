import { addNotes, removeNotes } from '../base/addRemoveNotes';
import { addNotice } from '@Global/state/globalState';

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
    addNotice({
      topic: MODIFY_TOURNAMENT_DETAIL,
      payload: {
        parentOrganisation: tournamentRecord.parentOrganisation,
        tournamentId,
        ...detailUpdates,
      },
    });
  }

  return { ...SUCCESS };
}

export function setTournamentNotes({ tournamentRecord, notes }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const result = notes ? addNotes({ element: tournamentRecord, notes }) : removeNotes({ element: tournamentRecord });
  if (result.error) return result;

  addNotice({
    topic: MODIFY_TOURNAMENT_DETAIL,
    payload: {
      parentOrganisation: tournamentRecord.parentOrganisation,
      tournamentId: tournamentRecord.tournamentId,
      notes: notes ?? '',
    },
  });

  return { ...SUCCESS };
}

export function setTournamentCategories({ tournamentRecord, categories }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  categories = (categories || []).filter((category) => category.categoryName && category.type);
  tournamentRecord.tournamentCategories = categories;

  addNotice({
    topic: MODIFY_TOURNAMENT_DETAIL,
    payload: {
      parentOrganisation: tournamentRecord.parentOrganisation,
      tournamentId: tournamentRecord.tournamentId,
      categories,
    },
  });

  return { ...SUCCESS };
}
