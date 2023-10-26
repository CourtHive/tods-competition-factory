import { getAllStructureMatchUps } from '../../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { isCompletedStructure } from '../../../drawEngine/governors/queryGovernor/structureActions';
import { allDrawMatchUps } from '../../getters/matchUpsGetter/matchUpsGetter';
import { structureSort } from '../../../drawEngine/getters/structureSort';
import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';
import { expect, it } from 'vitest';
import {
  extractAttributes,
  intersection,
  overlap,
  unique,
} from '../../../utilities';

import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import {
  COMPASS,
  MAIN,
  PLAY_OFF,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../../constants/drawDefinitionConstants';

it('is possible to have COMPASS playoff for Round Robin with playoffs', () => {
  const completionGoal = 48;
  const mockProfile = {
    tournamentName: 'RR with Compass',
    drawProfiles: [
      {
        drawType: ROUND_ROBIN_WITH_PLAYOFF,
        completionGoal,
        drawSize: 32,
        structureOptions: {
          playoffGroups: [
            {
              structureName: 'Gold Flight',
              finishingPositions: [1, 2],
              drawType: COMPASS,
            },
            {
              structureName: 'Silver Flight',
              finishingPositions: [3, 4],
              drawType: PLAY_OFF,
            },
          ],
        },
      },
    ],
  };

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord(mockProfile);

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });

  const sortedStrucctureIds = drawDefinition.structures
    .sort(structureSort)
    .map(({ structureId }) => structureId);

  // this is an exercise in sorting groups of linked structures...
  const linkRelationships = drawDefinition.links
    .sort(
      (a, b) =>
        sortedStrucctureIds.indexOf(a.source.structureId) -
        sortedStrucctureIds.indexOf(b.source.structureId)
    )
    .filter(({ linkType }) => linkType === 'LOSER')
    .map(({ source, target }) => [source.structureId, target.structureId]);

  const linkGroups = linkRelationships.reduce((groups, relationship) => {
    const existingGroup = groups.find((group) => overlap(group, relationship));
    if (existingGroup) {
      existingGroup.push(...relationship);
    } else {
      groups.push(relationship);
    }
    return groups;
  }, []);

  const groupedNames = linkGroups.map((group) =>
    unique(group).map(
      (structureId) =>
        drawDefinition.structures.find(
          (structure) => structure.structureId === structureId
        )?.structureName
    )
  );
  expect(groupedNames.length).toEqual(2);
  expect(groupedNames[0].sort()).toEqual([
    'Gold Flight East',
    'Gold Flight North',
    'Gold Flight Northeast',
    'Gold Flight Northwest',
    'Gold Flight South',
    'Gold Flight Southeast',
    'Gold Flight Southwest',
    'Gold Flight West',
  ]);
  expect(groupedNames[1].sort()).toEqual([
    'Silver Flight 17-32',
    'Silver Flight 19-20',
    'Silver Flight 21-24',
    'Silver Flight 23-24',
    'Silver Flight 25-32',
    'Silver Flight 27-28',
    'Silver Flight 29-32',
    'Silver Flight 31-32',
  ]);

  const drawMatchUps = allDrawMatchUps({ drawDefinition }).matchUps;
  const completedCount: number =
    drawMatchUps
      ?.map((m) => (m.matchUpStatus === COMPLETED ? 1 : 0))
      .reduce((a: number, b: number) => a + b, 0) ?? 0;
  expect(completedCount).toEqual(completionGoal);

  const mainStructure = drawDefinition.structures.find(
    ({ stage, stageSequence }) => stage === MAIN && stageSequence === 1
  );
  const structureMatchUps = getAllStructureMatchUps({
    structure: mainStructure,
  }).matchUps;
  expect(structureMatchUps.length).toEqual(completionGoal);

  const structureCompletedCount: number =
    drawMatchUps
      ?.map((m) => (m.matchUpStatus === COMPLETED ? 1 : 0))
      .reduce((a: number, b: number) => a + b, 0) ?? 0;
  expect(structureCompletedCount).toEqual(completionGoal);

  const mainStructureId = mainStructure.structureId;
  const structureIsComplete = isCompletedStructure({
    structureId: mainStructureId,
    drawDefinition,
  });
  expect(structureIsComplete).toEqual(true);

  const g1 = drawDefinition.structures
    .find((s) => s.structureName === 'Gold Flight East')
    .positionAssignments.map(extractAttributes('participantId'));

  const g2 = drawDefinition.structures
    .find((s) => s.structureName === 'Silver Flight 17-32')
    .positionAssignments.map(extractAttributes('participantId'));

  expect(intersection(g1, g2)).toEqual([]);
});
