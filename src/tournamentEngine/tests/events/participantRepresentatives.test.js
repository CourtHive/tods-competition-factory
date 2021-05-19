import mocksEngine from '../../../mocksEngine';
import { intersection } from '../../../utilities';
import tournamentEngine from '../../sync';

it('can set and get drawRepresentatitveIds', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 6,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  const { tournamentParticipants } = tournamentEngine
    .setState(tournamentRecord)
    .getTournamentParticipants();
  const participantIds = tournamentParticipants.map(
    ({ participantId }) => participantId
  );

  const representativeParticipantIds = participantIds.slice(0, 2);

  let result = tournamentEngine.setDrawParticipantRepresentativeIds({
    representativeParticipantIds,
    drawId,
  });
  expect(result.success).toEqual(true);

  const { representativeParticipantIds: retrievedIds } =
    tournamentEngine.getDrawParticipantRepresentativeIds({ drawId });

  expect(
    intersection(representativeParticipantIds, retrievedIds).length
  ).toEqual(representativeParticipantIds.length);

  result = tournamentEngine.setDrawParticipantRepresentativeIds({
    representativeParticipantIds: [],
    drawId,
  });
  expect(result.success).toEqual(true);

  const { representativeParticipantIds: updatedIds } =
    tournamentEngine.getDrawParticipantRepresentativeIds({ drawId });

  expect(updatedIds.length).toEqual(0);
});
