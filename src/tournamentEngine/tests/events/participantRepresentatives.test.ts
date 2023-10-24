import mocksEngine from '../../../mocksEngine';
import { intersection } from '../../../utilities';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';

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

  const { participants } = tournamentEngine
    .setState(tournamentRecord)
    .getParticipants();
  const participantIds = participants.map(({ participantId }) => participantId);

  const representativeParticipantIds = participantIds.slice(0, 2);

  let result = tournamentEngine.setDrawParticipantRepresentativeIds({
    representativeParticipantIds,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.setDrawParticipantRepresentativeIds({
    representativeParticipantIds: ['bogusId'],
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.setDrawParticipantRepresentativeIds({
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

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
