import { tournamentEngine } from '../../../tournamentEngine';

import { tournamentRecordWithParticipants } from '../primitives/generateTournament';

import { SUCCESS } from '../../../constants/resultConstants';
import { RATING } from '../../../constants/participantConstants';

it('can set participant scaleItems', () => {
  const { tournamentRecord } = tournamentRecordWithParticipants({
    participantsCount: 100,
  });
  tournamentEngine.setState(tournamentRecord);

  const participants = tournamentRecord.participants;

  const { participantId } = participants[0];
  const { participant } = tournamentEngine.findParticipant({ participantId });
  expect(participant.participantId).toEqual(participantId);

  const scaleItem = {
    scaleValue: 8.3,
    scaleName: 'WTN',
    scaleType: RATING,
    eventType: 'SINGLES',
    scaleDate: '2020-06-06',
  };

  let result = tournamentEngine.setParticipantScaleItem({
    participantId,
    scaleItem,
  });
  expect(result).toMatchObject(SUCCESS);

  let scaleAttributes = { scaleName: 'WTN' };
  ({ scaleItem: result } = tournamentEngine.getParticipantScaleItem({
    participantId,
    scaleAttributes,
  }));
  expect(result?.scaleValue).toEqual(scaleItem.scaleValue);

  scaleAttributes = { scaleName: 'U18' };
  ({ scaleItem: result } = tournamentEngine.getParticipantScaleItem({
    participantId,
    scaleAttributes,
  }));

  expect(result?.scaleValue).toEqual(undefined);
});
