import { tournamentEngine } from '../..';
import { generateTournament } from '../../../mocksEngine/generators/generateTournament';

import { SUCCESS } from '../../../constants/resultConstants';
import { RATING } from '../../../constants/scaleConstants';
import { RANKING } from '../../../constants/timeItemConstants';
import { VALUE_UNCHANGED } from '../../../constants/errorConditionConstants';
import { SINGLES } from '../../../constants/eventConstants';

it('can set participant scaleItems', () => {
  const { tournamentRecord, participants } = generateTournament({
    participantsCount: 100,
  });
  tournamentEngine.setState(tournamentRecord);

  const { participantId } = participants[0];
  const { participant } = tournamentEngine.findParticipant({ participantId });
  expect(participant.participantId).toEqual(participantId);

  let scaleItem = {
    scaleValue: 8.3,
    scaleName: 'WTN',
    scaleType: RATING,
    eventType: SINGLES,
    scaleDate: '2020-06-06',
  };

  let result = tournamentEngine.setParticipantScaleItem({
    participantId,
    scaleItem,
  });
  expect(result).toMatchObject(SUCCESS);

  let scaleAttributes = {
    scaleType: RATING,
    eventType: SINGLES,
    scaleName: 'WTN',
  };
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

  scaleItem = {
    scaleValue: 8.4,
    scaleName: 'WTN',
    scaleType: RATING,
    eventType: SINGLES,
    scaleDate: '2020-06-06',
  };

  result = tournamentEngine.setParticipantScaleItem({
    participantId,
    scaleItem,
  });
  expect(result).toMatchObject(SUCCESS);

  scaleItem = {
    scaleValue: 8.4,
    scaleName: 'WTN',
    scaleType: RATING,
    eventType: SINGLES,
    scaleDate: '2020-06-06',
  };

  result = tournamentEngine.setParticipantScaleItem({
    participantId,
    scaleItem,
  });
  expect(result).toMatchObject(SUCCESS);
  expect(result.message).toEqual(VALUE_UNCHANGED);

  scaleItem = {
    scaleValue: undefined,
    scaleName: 'WTN',
    scaleType: RATING,
    eventType: SINGLES,
    scaleDate: '2020-06-06',
  };

  result = tournamentEngine.setParticipantScaleItem({
    participantId,
    scaleItem,
  });
  expect(result).toMatchObject(SUCCESS);

  scaleItem = {
    scaleValue: undefined,
    scaleName: 'U16',
    scaleType: RANKING,
    eventType: SINGLES,
    scaleDate: '2020-06-06',
  };

  result = tournamentEngine.setParticipantScaleItem({
    participantId,
    scaleItem,
  });
  expect(result).toMatchObject(SUCCESS);
  expect(result.message).toEqual(VALUE_UNCHANGED);
});

it('can set participant scaleItems in bulk', () => {
  const { tournamentRecord, participants } = generateTournament({
    participantsCount: 100,
  });
  tournamentEngine.setState(tournamentRecord);

  const scaleItemsWithParticipantIds = participants.map((participant) => {
    const { participantId } = participant;
    const scaleItems = [
      {
        scaleValue: 8.3,
        scaleName: 'WTN',
        scaleType: RATING,
        eventType: SINGLES,
        scaleDate: '2021-01-01',
      },
      {
        scaleValue: 1,
        scaleName: 'U18',
        scaleType: RANKING,
        eventType: SINGLES,
        scaleDate: '2021-01-01',
      },
    ];

    return { participantId, scaleItems };
  });

  tournamentEngine.setParticipantScaleItems({
    scaleItemsWithParticipantIds,
  });

  const {
    tournamentRecord: { participants: modifiedParticipants },
  } = tournamentEngine.getState();

  modifiedParticipants.forEach((participant) => {
    expect(participant.timeItems.length).toEqual(2);
  });
});
