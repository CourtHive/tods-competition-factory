import { getSourceStructureIdsAndRelevantLinks } from '../../../getters/getSourceStructureIdsAndRelevantLinks';
import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';

import {
  QUALIFYING_PARTICIPANT,
  QUALIFYING_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';
import {
  POSITION,
  WINNER,
} from '../../../../constants/drawDefinitionConstants';
// import { INVALID_VALUES } from '../../../../constants/errorConditionConstants';
// import { decorateResult } from '../../../../global/functions/decorateResult';

export function getValidQualifiersAction({
  /*
  positionAssignments,
  activeDrawPositions,
  policyDefinitions,
  */
  drawPositionInitialRounds,
  tournamentParticipants,
  // isQualifierPosition, // restrict based on policyDefinition
  drawDefinition,
  drawPosition,
  structureId,
  drawId,
}) {
  const qualifyingParticipantIds = [];
  const qualifyingParticipants = [];
  const validAssignmentActions = [];
  const sourceStructureIds = [];

  // get the round number in which the drawPosition initially occurs
  const targetRoundNumber = drawPositionInitialRounds[drawPosition];

  const {
    sourceStructureIds: eliminationSoureStructureIds,
    relevantLinks: eliminationSourceLinks,
  } =
    getSourceStructureIdsAndRelevantLinks({
      targetRoundNumber, // look for soure structrues targeting roundNumber
      linkType: WINNER, // WINNER of qualifying structures will traverse link
      drawDefinition,
      structureId,
    }) || {};
  if (eliminationSoureStructureIds?.length)
    sourceStructureIds.push(...eliminationSoureStructureIds);

  const {
    sourceStructureIds: roundRobinSourceStructureIds,
    relevantLinks: roundRobinSourceLinks,
  } =
    getSourceStructureIdsAndRelevantLinks({
      targetRoundNumber, // look for soure structrues targeting roundNumber
      linkType: POSITION, // link will define how many finishingPositions traverse the link
      drawDefinition,
      structureId,
    }) || {};
  if (roundRobinSourceStructureIds?.length)
    sourceStructureIds.push(...roundRobinSourceStructureIds);

  for (const sourceLink of eliminationSourceLinks) {
    const structure = drawDefinition.structures?.find(
      (structure) => structure.structureId === sourceLink.source.structureId
    );
    const qualifyingRoundNumber = structure.qualifyingRoundNumber;
    const { matchUps } = getAllStructureMatchUps({
      matchUpFilters: { roundNumbers: [qualifyingRoundNumber] },
      tournamentParticipants,
      hasWinningSide: true,
      inContext: true,
      structure,
    });
    for (const matchUp of matchUps) {
      const winningSide = matchUp.sides.find(
        (side) => side?.sideNumber === matchUp.winningSide
      );
      const { participantId, participant } = winningSide || {};
      if (participantId) qualifyingParticipantIds.push(participantId);
      if (participant) qualifyingParticipants.push(participant);
    }
  }

  for (const sourceLink of roundRobinSourceLinks) {
    const structure = drawDefinition.structures?.find(
      (structure) => structure.structureId === sourceLink.source.structureId
    );
    // ensure structure is completed and get the participants who have finishingPosition in sourceLink.source.finishingPositions
    console.log('roundRobin', { structure });
  }

  // this should be "if qualifiers are available"
  if (qualifyingParticipantIds.length) {
    validAssignmentActions.push({
      payload: {
        qualifyingParticipantId: undefined, // to be provided by client
        drawPosition,
        structureId,
        drawId,
      },
      method: QUALIFYING_PARTICIPANT_METHOD,
      type: QUALIFYING_PARTICIPANT,
      qualifyingParticipantIds,
      qualifyingParticipants,
    });
  }

  return { validAssignmentActions };
}

/*
  if (sourceStructureIds.length > 1)
    return decorateResult({
      stack: 'getValidQualifiersSaction',
      info: 'too many source structures',
      result: { error: INVALID_VALUES },
      context: { sourceStructureIds },
    });
  */
