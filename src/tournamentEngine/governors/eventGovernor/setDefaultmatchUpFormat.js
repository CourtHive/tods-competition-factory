import { setMatchUpFormat } from '../../../drawEngine/governors/matchUpGovernor/matchUpFormat';
import { isValid } from '../../../matchUpEngine/governors/matchUpFormatGovernor/isValid';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_EVENT,
  MISSING_MATCHUP_FORMAT,
  MISSING_TOURNAMENT_RECORD,
  UNRECOGNIZED_MATCHUP_FORMAT,
} from '../../../constants/errorConditionConstants';

export function setEventDefaultMatchUpFormat({
  tournamentRecord,
  matchUpFormat,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (!event) return { error: MISSING_EVENT };

  if (!isValid(matchUpFormat)) return { error: UNRECOGNIZED_MATCHUP_FORMAT };

  event.matchUpFormat = matchUpFormat;

  return { ...SUCCESS };
}

export function setDrawDefaultMatchUpFormat({
  tournamentRecord,
  drawDefinition,
  matchUpFormat,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };

  return setMatchUpFormat({ tournamentRecord, drawDefinition, matchUpFormat });
}
