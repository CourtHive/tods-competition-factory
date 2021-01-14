import { findTournamentExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';

import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function findExtensions({ tournamentRecords, name }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!name) return { error: MISSING_VALUE, message: 'Missing name' };

  const errors = [];
  const extensions = tournamentRecords
    .filter((f) => f)
    .map((tournamentRecord) => {
      const { tournamentId } = tournamentRecord;
      const { extension, error } = findTournamentExtension({
        tournamentRecord,
        name,
      });
      if (error) errors.push({ error, tournamentId });
      return extension;
    })
    .filter((f) => f && !f.message);

  if (!extensions?.length) return { message: NOT_FOUND };

  return { extensions, error: errors.length && errors };
}
