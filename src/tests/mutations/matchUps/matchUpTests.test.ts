import { generateDrawTypeAndModifyDrawDefinition } from '../../../assemblies/generators/drawDefinitions/generateDrawTypeAndModifyDrawDefinition';
import { newDrawDefinition } from '../../../assemblies/generators/drawDefinitions/newDrawDefinition';
import { getAllStructureMatchUps } from '../../../query/matchUps/getAllStructureMatchUps';
import { setMatchUpFormat } from '../../../mutate/matchUps/matchUpFormat/setMatchUpFormat';
import { getStructureMatchUps } from '../../../query/structure/getStructureMatchUps';
import { setStageDrawSize } from '../../../mutate/drawDefinitions/entryGovernor/stageEntryCounts';
import { getDrawMatchUps } from '../../../query/matchUps/drawMatchUps';
import { getMatchUpType } from '../../../query/matchUp/getMatchUpType';
import { findDrawMatchUp } from '../../../acquire/findDrawMatchUp';
import { getDrawStructures } from '../../../acquire/findStructure';
import { expect, it } from 'vitest';

import { DrawDefinition } from '../../../types/tournamentTypes';
import { SINGLES } from '../../../constants/matchUpTypes';
import {
  MAIN,
  ROUND_ROBIN,
  SINGLE_ELIMINATION,
} from '../../../constants/drawDefinitionConstants';
import {
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_FORMAT,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

it('can return matchUps from an SINGLE_ELIMINATION structure', () => {
  const drawDefinition: DrawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: MAIN, drawSize: 16 });
  const structure = generateDrawTypeAndModifyDrawDefinition({
    drawType: SINGLE_ELIMINATION,
    drawDefinition,
  })?.structures?.[0];
  const { matchUps } = getAllStructureMatchUps({ structure, inContext: true });
  expect(matchUps.length).toEqual(15);
  const { upcomingMatchUps } = getStructureMatchUps({
    requireParticipants: false,
    structure,
  });
  expect(upcomingMatchUps?.length).toEqual(8);

  const { matchUpType } = getMatchUpType({
    matchUp: matchUps[0],
  });
  expect(matchUpType).toEqual(SINGLES);
});

it('matchUps returned with context cannot modify original', () => {
  const drawDefinition: DrawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: MAIN, drawSize: 16 });
  generateDrawTypeAndModifyDrawDefinition({
    drawType: SINGLE_ELIMINATION,
    drawDefinition,
  });
  const { drawId } = drawDefinition;
  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage: MAIN });
  const { structureId } = structure;
  const { matchUps } = getAllStructureMatchUps({ structure });

  // no matchUp should include a drawId
  matchUps.forEach((matchUp) => expect(matchUp.drawId).toEqual(undefined));

  const matchUp = matchUps[0];
  const { matchUpId } = matchUp;

  // refetch the drawDefintion after the modification has been made
  let { matchUp: retrievedMatchUp } = findDrawMatchUp({
    drawDefinition,
    matchUpId,
  });
  expect(retrievedMatchUp?.drawId).toEqual(undefined);
  expect(retrievedMatchUp?.structureId).toEqual(undefined);

  // retrieve matchUp with context and add an attribute
  const { matchUp: contextMatchUp } = findDrawMatchUp({
    drawDefinition,
    matchUpId,
    inContext: true,
  });
  if (contextMatchUp) contextMatchUp.newAttribute = 'newAttribute';

  // contextMatchUp should include drawId and structureId
  expect(contextMatchUp?.drawId).toEqual(drawId);
  expect(contextMatchUp?.structureId).toEqual(structureId);

  // retrieve matchUp from drawDefinition
  // newAttribute should not be present with no context added
  ({ matchUp: retrievedMatchUp } = findDrawMatchUp({
    drawDefinition,
    matchUpId,
  }));
  expect(retrievedMatchUp?.newAttribute).toEqual(undefined);
  expect(retrievedMatchUp?.drawId).toEqual(undefined);
  expect(retrievedMatchUp?.structureId).toEqual(undefined);
});

it('can return matchUps from a ROUND_ROBIN structure', () => {
  const drawType = ROUND_ROBIN;
  const drawDefinition: DrawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: MAIN, drawSize: 16 });
  const structure = generateDrawTypeAndModifyDrawDefinition({
    drawDefinition,
    drawType,
  }).structures?.[0];
  const { matchUps } = getAllStructureMatchUps({ structure });
  expect(matchUps.length).toEqual(24);
  const { upcomingMatchUps } = getStructureMatchUps({
    requireParticipants: false,
    structure,
  });
  expect(upcomingMatchUps?.length).toEqual(24);
  const { upcomingMatchUps: filteredActiveMatchUps } = getStructureMatchUps({
    matchUpFilters: { roundNumbers: [1] },
    requireParticipants: false,
    structure,
  });
  expect(filteredActiveMatchUps?.length).toEqual(8);

  const allDrawMatchUps = getDrawMatchUps({
    requireParticipants: false,
    inContext: true,
    drawDefinition,
  });

  expect(allDrawMatchUps?.upcomingMatchUps?.length).toEqual(24);
  expect(allDrawMatchUps?.pendingMatchUps?.length).toEqual(0);
  expect(allDrawMatchUps?.completedMatchUps?.length).toEqual(0);
});

it('can set matchUpFormat', () => {
  const drawDefinition: DrawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: MAIN, drawSize: 16 });
  const structure = generateDrawTypeAndModifyDrawDefinition({
    drawType: SINGLE_ELIMINATION,
    drawDefinition,
  })?.structures?.[0];
  const { matchUps } = getAllStructureMatchUps({ structure });
  expect(matchUps.length).toEqual(15);
  const { upcomingMatchUps } = getStructureMatchUps({
    requireParticipants: false,
    structure,
  });

  const matchUpFormat = 'SET1-S:T10';
  const matchUp = upcomingMatchUps?.[0];
  expect(matchUp?.matchUpFormat).toEqual(undefined);

  const matchUpId = matchUp?.matchUpId as string;
  let result = setMatchUpFormat({ drawDefinition, matchUpId, matchUpFormat });
  expect(result.success).toEqual(true);

  const { matchUp: modifiedMatchUp } = findDrawMatchUp({
    drawDefinition,
    matchUpId,
  });
  expect(modifiedMatchUp?.matchUpFormat).toEqual(matchUpFormat);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  result = setMatchUpFormat({ drawDefinition, matchUpId });
  expect(result.error).toEqual(MISSING_MATCHUP_FORMAT);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  result = setMatchUpFormat({ matchUpId: 'bogus matchUpId', matchUpFormat });
  expect(result.error).toEqual(MISSING_DRAW_DEFINITION);
  result = setMatchUpFormat({
    matchUpId: 'bogus matchUpId',
    drawDefinition,
    matchUpFormat,
  });
  expect(result.error).toEqual(MATCHUP_NOT_FOUND);
  result = setMatchUpFormat({
    structureId: 'bogus structureId',
    drawDefinition,
    matchUpFormat,
  });
  expect(result.error).toEqual(STRUCTURE_NOT_FOUND);
  result = setMatchUpFormat({
    structureId: structure?.structureId,
    drawDefinition,
    matchUpFormat,
  });
  expect(result.success).toEqual(true);
});
