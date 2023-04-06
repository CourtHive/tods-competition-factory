import { getParticipants } from '../getters/participants/getParticipants';
import { getParticipantId } from '../../global/functions/extractors';
import { isNumeric } from '../../utilities/math';
import { generateRange } from '../../utilities';

import { DOUBLES_MATCHUP, SINGLES_MATCHUP } from '../../constants/matchUpTypes';
import { DIRECT_ACCEPTANCE } from '../../constants/entryStatusConstants';
import { TEAM_EVENT } from '../../constants/eventConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  INVALID_EVENT_TYPE,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';

// by default if there are no scaleValues matching the scaleAccessor then participants will be assigned in the array order of [team].individidualParticipantIds
export function generateLineUps({
  tournamentRecord,
  drawDefinition,
  scaleAccessor, // e.g. { scaleType: 'RANKINGS', scaleName: 'U18', accessor: 'wtnRating' }
  singlesOnly, // use singles scale for doubles events
  event,
}) {
  if (event?.eventType !== TEAM_EVENT) return { error: INVALID_EVENT_TYPE };
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };
  if (typeof scaleAccessor !== 'object')
    return { error: INVALID_VALUES, context: { scaleAccessor } };

  const lineUps = [];

  const targetEntries = (drawDefinition.entries || []).filter(
    (entry) => entry?.entryStatus === DIRECT_ACCEPTANCE
  );

  const participantIds = targetEntries.map(getParticipantId);
  const teamParticipants = getParticipants({
    participantFilters: { participantIds },
    withIndividualParticipants: true,
  });

  const formatScaleType = (str) =>
    str.slice(0, 1).toUpperCase() + str.slice(1, str.length).toLowerCase();

  const { scaleType, scaleName, accessor } = scaleAccessor;
  const formattedScaleType = formatScaleType(scaleType);
  const getScaleValue = (individualParticipant, matchUpType) => {
    const matchUpTypeScales =
      individualParticipant[formattedScaleType]?.[matchUpType];
    if (Array.isArray(matchUpTypeScales)) {
      const scaleValue = matchUpTypeScales.find(
        (scale) => scale.scaleName === scaleName
      )?.scaleValue;
      if (isNumeric(scaleValue)) return scaleValue;
      if (accessor && typeof scaleValue === 'object')
        return scaleValue[accessor];
    }
    return 0;
  };
  const singlesScaleSort = (a, b) =>
    getScaleValue(a, SINGLES_MATCHUP) - getScaleValue(b, SINGLES_MATCHUP);
  const doublesScaleSort = (a, b) =>
    getScaleValue(a, DOUBLES_MATCHUP) - getScaleValue(b, DOUBLES_MATCHUP);

  const collectionDefinitions =
    drawDefinition.tieFormat?.collectionDefinitions || [];
  for (const teamParticipant of teamParticipants) {
    const singlesSort =
      teamParticipant.individualParticipants.sort(singlesScaleSort);
    const doublesSort = singlesOnly
      ? singlesSort
      : teamParticipant.individualParticipants.sort(doublesScaleSort);

    const participantAssignments = {};
    for (const collectionDefinition of collectionDefinitions) {
      const { collectionId, matchUpsCount, matchUpType } = collectionDefinition;
      generateRange(0, matchUpsCount).forEach((i) => {
        const collectionPosition = i + 1;
        const typeSort =
          matchUpType === SINGLES_MATCHUP ? singlesSort : doublesSort;
        const participantId = typeSort[i]?.participantId;
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
    lineUps.push(lineUp);
  }

  return { ...SUCCESS, lineUps };
}
