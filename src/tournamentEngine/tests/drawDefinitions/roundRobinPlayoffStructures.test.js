import { structureSort } from '../../../drawEngine/getters/structureSort';
import { overlap, unique } from '../../../utilities';
import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

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
    'Silver Flight 1-16',
    'Silver Flight 11-12',
    'Silver Flight 13-16',
    'Silver Flight 15-16',
    'Silver Flight 3-4',
    'Silver Flight 5-8',
    'Silver Flight 7-8',
    'Silver Flight 9-16',
  ]);
});
