import { structureSort } from '../../../drawEngine/getters/structureSort';
import { overlap, unique } from '../../../utilities';
import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';
import { expect, it } from 'vitest';

import {
  COMPASS,
  PLAY_OFF,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../../constants/drawDefinitionConstants';

it('is possible to have COMPASS playoff for Round Robin with playoffs', () => {
  const mockProfile = {
    tournamentName: 'RR with Compass',
    completeAllMatchUps: true,
    drawProfiles: [
      {
        drawType: ROUND_ROBIN_WITH_PLAYOFF,
        drawSize: 32,
        structureOptions: {
          playoffGroups: [
            {
              finishingPositions: [1, 2],
              structureName: 'Gold Flight',
              drawType: COMPASS,
            },
            {
              finishingPositions: [3, 4],
              structureName: 'Silver Flight',
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
    'Gold Flight EAST',
    'Gold Flight NORTH',
    'Gold Flight NORTHEAST',
    'Gold Flight NORTHWEST',
    'Gold Flight SOUTH',
    'Gold Flight SOUTHEAST',
    'Gold Flight SOUTHWEST',
    'Gold Flight WEST',
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
});
