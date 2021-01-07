import tournamentEngine from '../..';
import mocksEngine from '../../../mocksEngine';

it('can add 3-4 playoff structure to a SINGLE ELIMINATION structure', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 8,
      outcomes: [
        [1, 1, '6-2 6-1', 1],
        [1, 2, '6-2 6-1', 1],
        [1, 3, '6-2 6-1', 1],
        [1, 4, '6-2 6-1', 1],
        [2, 1, '6-2 6-1', 1],
        [2, 2, '6-2 6-1', 1],
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

  const consolationAssignedParticipantIds = structures[1].positionAssignments
    .map(({ participantId }) => participantId)
    .filter((f) => f);
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
  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const {
    structures: [{ structureId }],
  } = drawDefinition;

  return tournamentEngine.addPlayoffStructures({
    drawId,
    structureId,
    roundNumbers,
    playoffPositions,
    playoffStructureNameBase,
  });
}
