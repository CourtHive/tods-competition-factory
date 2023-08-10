import { resolveTieFormat } from '../../matchUpEngine/governors/tieFormatGovernor/getTieFormat/resolveTieFormat';
import { validateTieFormat } from '../../matchUpEngine/governors/tieFormatGovernor/tieFormatUtilities';
import { getPairedParticipant } from '../governors/participantGovernor/getPairedParticipant';
import { addParticipant } from '../governors/participantGovernor/addParticipants';
import { addExtension } from '../../global/functions/producers/addExtension';
import { getParticipants } from '../getters/participants/getParticipants';
import { getParticipantId } from '../../global/functions/extractors';
import { isNumeric } from '../../utilities/math';
import { generateRange } from '../../utilities';

import { DOUBLES_MATCHUP, SINGLES_MATCHUP } from '../../constants/matchUpTypes';
import { DIRECT_ACCEPTANCE } from '../../constants/entryStatusConstants';
import { FEMALE, MALE, MIXED } from '../../constants/genderConstants';
import { COMPETITOR } from '../../constants/participantRoles';
import { DESCENDING } from '../../constants/sortingConstants';
import { LINEUPS } from '../../constants/extensionConstants';
import { TEAM_EVENT } from '../../constants/eventConstants';
import { PAIR } from '../../constants/participantConstants';
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
  useDefaultEventRanking,
  tournamentRecord,
  drawDefinition,
  scaleAccessor, // e.g. { scaleType: 'RANKINGS', scaleName: 'U18', accessor: 'wtnRating', sortOrder: 'ASC' }
  singlesOnly, // use singles scale for doubles events
  tieFormat,
  attach, // boolean - when true attach LINEUPS extension to drawDefinition and add new PAIR participants (where necessary)
  event,
}) {
  if (event?.eventType !== TEAM_EVENT) return { error: INVALID_EVENT_TYPE };
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tieFormat && !drawDefinition)
    return { error: DRAW_DEFINITION_NOT_FOUND };

  tieFormat =
    tieFormat || resolveTieFormat({ drawDefinition, event })?.tieFormat;

  if (validateTieFormat({ tieFormat }).error)
    return { error: INVALID_TIE_FORMAT };

  if (typeof scaleAccessor !== 'object' && !useDefaultEventRanking)
    return { error: INVALID_VALUES, context: { scaleAccessor } };

  const lineUps = {};

  const targetEntries = (drawDefinition?.entries || event.entries).filter(
    (entry) => entry?.entryStatus === DIRECT_ACCEPTANCE
  );

  const participantIds = targetEntries.map(getParticipantId);
  const { participants = [] } = getParticipants({
    withIndividualParticipants: true,
    withScaleValues: true,
    tournamentRecord,
  });

  const teamParticipants = participants.filter(({ participantId }) =>
    participantIds.includes(participantId)
  );

  const formatScaleType = (type) => (type === RANKING ? 'rankings' : 'ratings');

  const defaultScaleName =
    event?.category?.categoryName || event?.category?.ageCategoryCode;
  const {
    scaleName = defaultScaleName,
    scaleType = RANKING,
    sortOrder,
    accessor,
  } = scaleAccessor || {};

  const formattedScaleType = formatScaleType(scaleType);
  const getScaleValue = (individualParticipant, matchUpType) => {
    let matchUpTypeScales =
      individualParticipant[formattedScaleType]?.[matchUpType];

    // if { userDefaultEventRanking: true } fallback to SINGLES if no values for DOUBLES
    if (!matchUpTypeScales && useDefaultEventRanking) {
      matchUpTypeScales =
        individualParticipant[formattedScaleType]?.[SINGLES_MATCHUP];
    }

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

  const participantIdPairs = [];
  const collectionDefinitions = tieFormat.collectionDefinitions || [];
  for (const teamParticipant of teamParticipants) {
    const singlesSort =
      teamParticipant.individualParticipants.sort(singlesScaleSort);
    const doublesSort = singlesOnly
      ? singlesSort
      : teamParticipant.individualParticipants.sort(doublesScaleSort);

    const participantAssignments = {};
    for (const collectionDefinition of collectionDefinitions) {
      const collectionParticipantIds = [];
      const { collectionId, matchUpCount, matchUpType, gender } =
        collectionDefinition;
      const singlesMatchUp = matchUpType === SINGLES_MATCHUP;

      generateRange(0, matchUpCount).forEach((i) => {
        const typeSort = singlesMatchUp ? singlesSort : doublesSort;
        const collectionPosition = i + 1;

        const participantIds = [];
        generateRange(0, singlesMatchUp ? 1 : 2).forEach((i) => {
          const nextParticipantId = typeSort.find((participant) => {
            const targetGender =
              ([MALE, FEMALE].includes(gender) && gender) ||
              (gender === MIXED && [MALE, FEMALE][i]);
            return (
              (!targetGender || targetGender === participant.person.sex) &&
              !collectionParticipantIds.includes(participant.participantId)
            );
          }).participantId;

          // keep track of participantIds which have already been assigned
          if (nextParticipantId) {
            participantIds.push(nextParticipantId);
            collectionParticipantIds.push(nextParticipantId);
            if (!participantAssignments[nextParticipantId])
              participantAssignments[nextParticipantId] = [];
            participantAssignments[nextParticipantId].push({
              collectionPosition,
              collectionId,
            });
          }
        });
        if (!singlesMatchUp) participantIdPairs.push(participantIds);
      });
    }

    const lineUp = Object.keys(participantAssignments).map((participantId) => ({
      collectionAssignments: participantAssignments[participantId],
      participantId,
    }));

    lineUps[teamParticipant.participantId] = lineUp;
  }

  const participantsToAdd = [];
  for (const pairParticipantIds of participantIdPairs) {
    const { participant: existingPairParticipant } = getPairedParticipant({
      tournamentParticipants: participants,
      participantIds: pairParticipantIds,
    });
    if (!existingPairParticipant) {
      const newPairParticipant = {
        individualParticipantIds: pairParticipantIds,
        participantRole: COMPETITOR,
        participantType: PAIR,
      };
      participantsToAdd.push(newPairParticipant);
    }
  }

  if (attach) {
    while (participantsToAdd.length) {
      addParticipant({
        participant: participantsToAdd.pop(),
        tournamentRecord,
      });
    }
    const extension = { name: LINEUPS, value: lineUps };
    addExtension({ element: drawDefinition, extension });
  }

  return { ...SUCCESS, lineUps, participantsToAdd };
}
