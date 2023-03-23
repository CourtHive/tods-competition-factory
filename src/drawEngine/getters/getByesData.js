import { getAllStructureMatchUps } from './getMatchUps/getAllStructureMatchUps';
import { structureAssignedDrawPositions } from './positionsGetter';
import { getQualifiersCount } from './getQualifiersCount';
import { getStageEntries } from './stageGetter';

import { STRUCTURE_SELECTED_STATUSES } from '../../constants/entryStatusConstants';
import {
  CONSOLATION,
  CONTAINER,
} from '../../constants/drawDefinitionConstants';

export function getByesData({
  provisionalPositioning,
  drawDefinition,
  matchUpsMap,
  structure,
  event,
}) {
  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps, roundMatchUps } = getAllStructureMatchUps({
    afterRecoveryTimes: false,
    provisionalPositioning,
    drawDefinition,
    matchUpFilters,
    matchUpsMap,
    structure,
    event,
  });
  const firstRoundMatchUps = (roundMatchUps && roundMatchUps[1]) || [];

  // firstRoundMatchUps don't work for CONTAINER / ROUND_ROBIN structures

  const isRoundRobin = structure?.structureType === CONTAINER;
  const relevantMatchUps = isRoundRobin ? matchUps : firstRoundMatchUps;

  // maxByes for RR can only be the number of structures... no more than one bye per structure
  const maxByes = isRoundRobin
    ? structure?.structures?.length || 0
    : matchUps.length;

  // get stage/stageSequence Entries and qualifiers
  const { structureId, stage, stageSequence } = structure;
  const entries = getStageEntries({
    entryStatuses: STRUCTURE_SELECTED_STATUSES,
    provisionalPositioning,
    drawDefinition,
    stageSequence,
    structureId,
    stage,
  });

  const { qualifiersCount } = getQualifiersCount({
    provisionalPositioning,
    drawDefinition,
    stageSequence,
    structureId,
    stage,
  });
  const entriesCount = entries.length + qualifiersCount;

  // # Byes = drawSize (positionAssignments) - total entries
  // const { positionAssignments, qualifierPositions, byePositions, unassignedPositions } = structureAssignedDrawPositions({structure});
  const { positionAssignments, unassignedPositions } =
    structureAssignedDrawPositions({ structure });
  const unassignedDrawPositions = unassignedPositions.map(
    (position) => position.drawPosition
  );
  const placedByes = positionAssignments.filter(
    (assignment) => assignment.bye
  ).length;
  const placedByePositions = positionAssignments
    .filter((assignment) => assignment.bye)
    .map((assignment) => assignment.drawPosition);

  const positionsToAvoidDoubleBye = relevantMatchUps
    .map((matchUp) => matchUp.drawPositions)
    .filter((drawPositions) => {
      return (
        drawPositions &&
        drawPositions?.reduce(
          (noBye, drawPosition) =>
            !placedByePositions.includes(drawPosition) && noBye,
          true
        )
      );
    })
    .flat(Infinity)
    .filter((drawPosition) => unassignedDrawPositions.includes(drawPosition));

  const drawSize = positionAssignments.length;
  let byesCount = drawSize - entriesCount;
  if (
    byesCount > maxByes &&
    structure.stageSequence === 1 &&
    structure.stage !== CONSOLATION
  ) {
    byesCount = maxByes;
  }

  return {
    placedByes,
    byesCount,
    relevantMatchUps,
    placedByePositions,
    roundMatchUps,
    positionsToAvoidDoubleBye,
  };
}
