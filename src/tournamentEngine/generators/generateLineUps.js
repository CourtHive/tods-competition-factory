import { validateTieFormat } from '../../matchUpEngine/governors/tieFormatGovernor/tieFormatUtilities';
import { getParticipants } from '../getters/participants/getParticipants';
import { getParticipantId } from '../../global/functions/extractors';
import { isNumeric } from '../../utilities/math';
import { generateRange } from '../../utilities';

import { DOUBLES_MATCHUP, SINGLES_MATCHUP } from '../../constants/matchUpTypes';
import { DIRECT_ACCEPTANCE } from '../../constants/entryStatusConstants';
import { DESCENDING } from '../../constants/sortingConstants';
import { TEAM_EVENT } from '../../constants/eventConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { RANKING } from '../../constants/scaleConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  INVALID_EVENT_TYPE,
  INVALID_TIE_FORMAT,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';

// by default if there are no scaleValues matching the scaleAccessor then participants will be assigned in the array order of [team].individidualParticipantIds
export function generateLineUps({
  tournamentRecord,
  drawDefinition,
  scaleAccessor, // e.g. { scaleType: 'RANKINGS', scaleName: 'U18', accessor: 'wtnRating', sortOrder: 'ASC' }
  singlesOnly, // use singles scale for doubles events
  tieFormat,
  event,
}) {
  if (event?.eventType !== TEAM_EVENT) return { error: INVALID_EVENT_TYPE };
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tieFormat && !drawDefinition)
    return { error: DRAW_DEFINITION_NOT_FOUND };

  tieFormat = tieFormat || drawDefinition?.tieFormat || event.tieFormat;

  if (validateTieFormat({ tieFormat }).error)
    return { error: INVALID_TIE_FORMAT };

  if (typeof scaleAccessor !== 'object')
    return { error: INVALID_VALUES, context: { scaleAccessor } };

  const lineUps = {};

  const targetEntries = (drawDefinition?.entries || event.entries).filter(
    (entry) => entry?.entryStatus === DIRECT_ACCEPTANCE
  );

  const participantIds = targetEntries.map(getParticipantId);
  const teamParticipants =
    getParticipants({
      participantFilters: { participantIds },
      withIndividualParticipants: true,
      withScaleValues: true,
      tournamentRecord,
    }).participants || [];

  const formatScaleType = (type) => (type === RANKING ? 'rankings' : 'ratings');

  const { scaleType, scaleName, sortOrder, accessor } = scaleAccessor;
  const formattedScaleType = formatScaleType(scaleType);
  const getScaleValue = (individualParticipant, matchUpType) => {
    const matchUpTypeScales =
      individualParticipant[formattedScaleType]?.[matchUpType];

    if (Array.isArray(matchUpTypeScales)) {
      const scaleValue = matchUpTypeScales.find(
        (scale) => scale.scaleName === scaleName
      )?.scaleValue;
      if (isNumeric(scaleValue)) {
        return scaleValue;
      } else if (accessor && typeof scaleValue === 'object')
        return scaleValue[accessor];
    }
    return 0;
  };
  const sortMethod = (a, b, matchUpType) => {
    const x = sortOrder === DESCENDING ? b : a;
    const y = sortOrder === DESCENDING ? a : b;
    return getScaleValue(x, matchUpType) - getScaleValue(y, matchUpType);
  };
  const singlesScaleSort = (a, b) => sortMethod(a, b, SINGLES_MATCHUP);
  const doublesScaleSort = (a, b) => sortMethod(a, b, DOUBLES_MATCHUP);

  const collectionDefinitions = tieFormat.collectionDefinitions || [];
  for (const teamParticipant of teamParticipants) {
    const singlesSort =
      teamParticipant.individualParticipants.sort(singlesScaleSort);
    const doublesSort = singlesOnly
      ? singlesSort
      : teamParticipant.individualParticipants.sort(doublesScaleSort);

    const participantAssignments = {};
    for (const collectionDefinition of collectionDefinitions) {
      const { collectionId, matchUpCount, matchUpType } = collectionDefinition;
      generateRange(0, matchUpCount).forEach((i) => {
        const collectionPosition = i + 1;
        const typeSort =
          matchUpType === SINGLES_MATCHUP ? singlesSort : doublesSort;
        const participantId = typeSort[i]?.participantId;

        // TODO: for DOUBLES collectionPositions need to have two participants assigned to them
        if (participantId) {
          if (!participantAssignments[participantId])
            participantAssignments[participantId] = [];
          participantAssignments[participantId].push({
            collectionPosition,
            collectionId,
          });
        }
      });
    }

    const lineUp = Object.keys(participantAssignments).map((participantId) => ({
      collectionAssignments: participantAssignments[participantId],
      participantId,
    }));

    lineUps[teamParticipant.participantId] = lineUp;
  }

  return { ...SUCCESS, lineUps };
}
