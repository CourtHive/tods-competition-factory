import { getParticipantIds } from '../../../global/functions/extractors';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

tournamentEngine.devContext(true);

it('can add 3-4 playoff structure to a SINGLE ELIMINATION structure', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 8,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 1,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 3,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 4,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 1,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 2,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
      ],
    },
  ];
  const { success, drawDefinition } = tournamentEngineAddPlayoffsTest({
    drawProfiles,
    playoffPositions: [3, 4],
    playoffStructureNameBase: 'Playoff',
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(1);
  expect(structures.length).toEqual(2);
  expect(structures[1].structureName).toEqual('Playoff 3-4');

  const consolationAssignedParticipantIds = getParticipantIds(
    structures[1].positionAssignments
  );
  expect(consolationAssignedParticipantIds.length).toEqual(2);
});

function tournamentEngineAddPlayoffsTest({
  playoffPositions,
  roundNumbers,
  drawProfiles,
  playoffStructureNameBase,
}) {
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);
  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const {
    structures: [{ structureId }],
  } = drawDefinition;

  const result = tournamentEngine.addPlayoffStructures({
    drawId,
    structureId,
    roundNumbers,
    playoffPositions,
    playoffStructureNameBase,
  });
  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  return { ...result, drawDefinition };
}
