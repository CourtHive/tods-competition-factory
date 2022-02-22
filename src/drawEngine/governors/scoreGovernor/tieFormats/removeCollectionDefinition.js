// all child matchUps need to be checked for collectionAssignments which need to be removed when collectionDefinition.collectionIds are removed

import { NOT_FOUND } from '../../../../constants/errorConditionConstants';
import { TEAM } from '../../../../constants/matchUpTypes';
import { allDrawMatchUps } from '../../../../tournamentEngine/getters/matchUpsGetter';
import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { getTieFormat } from './getTieFormat';

/*
 * collectionDefinition will be added to an event tieFormat (if present)
 * if a matchUpId is provided, will be added to matchUp.tieFormat
 * if a structureId is provided, will be added to structure.tieFormat
 * TODO: determine whether all contained instances of tieFormat should be updated
 */
export function removeCollectionDefinition({
  drawDefinition,
  collectionId,
  structureId,
  matchUpId,
  eventId,
  event,
}) {
  let result = getTieFormat({
    drawDefinition,
    structureId,
    matchUpId,
    eventId,
    event,
  });
  if (result.error) return result;

  const { matchUp, structure, tieFormat } = result;
  const collectionExists = tieFormat?.collectionDefinitions?.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );
  if (!collectionExists) return { error: NOT_FOUND, collectionId };

  // check all scoped lineUps in the drawDefinition to identify collectionAssignments
  let matchUps = [];

  if (matchUpId && matchUp) {
    matchUps = [matchUp];
  } else if (structureId && structure) {
    matchUps = allDrawMatchUps({
      drawDefinition,
      matchUpFilters: { matchUpTypes: [TEAM] },
    })?.matchUps;
  } else {
    matchUps = getAllStructureMatchUps({
      structure,
      matchUpFilters: { matchUpTypes: [TEAM] },
    })?.matchUps;
  }

  // remove any collectionAssignments from LineUps that include collectionId
  for (const matchUp of matchUps) {
    for (const side of matchUp?.sides || []) {
      side.lineUp = (side.lineUp || []).map((assignment) =>
        (assignment?.collectionAssignments || []).filter(
          (collectionAssignment) =>
            collectionAssignment.collectionId !== collectionId
        )
      );
    }
  }
}
