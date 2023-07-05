import competitionEngine from '../../../competitionEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { tournamentEngine } from '../../sync';
import { expect, it } from 'vitest';

import {
  SCALE_ITEM_NOT_FOUND,
  VALUE_UNCHANGED,
} from '../../../constants/errorConditionConstants';
import { RANKING } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { RATING } from '../../../constants/scaleConstants';

const scaleDate = '2020-06-06';

it('can set participant scaleItems', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 100 },
  });

  const { participants } = tournamentRecord;
  tournamentEngine.setState(tournamentRecord);

  const { participantId } = participants[0];
  const { participant } = tournamentEngine.findParticipant({ participantId });
  expect(participant.participantId).toEqual(participantId);

  let tournamentId, error;
  let scaleItem = {
    scaleValue: 8.3,
    scaleName: 'WTN',
    scaleType: RATING,
    eventType: SINGLES,
    scaleDate,
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
    scaleAttributes,
    participantId,
  }));
  expect(result?.scaleValue).toEqual(scaleItem.scaleValue);

  ({ scaleItem: result, tournamentId } =
    competitionEngine.getParticipantScaleItem({
      scaleAttributes,
      participantId,
    }));
  expect(result?.scaleValue).toEqual(scaleItem.scaleValue);
  expect(tournamentId).toEqual(tournamentRecord.tournamentId);

  scaleAttributes = { scaleName: 'U18' };
  ({ scaleItem: result, error } = tournamentEngine.getParticipantScaleItem({
    scaleAttributes,
    participantId,
  }));
  expect(result?.scaleValue).toEqual(undefined);
  expect(error).toEqual(SCALE_ITEM_NOT_FOUND);

  ({
    scaleItem: result,
    tournamentId,
    error,
  } = competitionEngine.getParticipantScaleItem({
    scaleAttributes,
    participantId,
  }));
  expect(result?.scaleValue).toEqual(undefined);
  expect(error).toEqual(SCALE_ITEM_NOT_FOUND);
  expect(tournamentId).toEqual(tournamentRecord.tournamentId);

  scaleItem = {
    scaleValue: 8.4,
    scaleName: 'WTN',
    scaleType: RATING,
    eventType: SINGLES,
    scaleDate,
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
    scaleDate,
  };

  result = tournamentEngine.setParticipantScaleItem({
    participantId,
    scaleItem,
  });
  expect(result).toMatchObject(SUCCESS);
  expect(result.info).toEqual(VALUE_UNCHANGED);

  scaleItem = {
    scaleValue: undefined,
    scaleName: 'WTN',
    scaleType: RATING,
    eventType: SINGLES,
    scaleDate,
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
    scaleDate,
  };

  result = tournamentEngine.setParticipantScaleItem({
    participantId,
    scaleItem,
  });
  expect(result).toMatchObject(SUCCESS);
  expect(result.info).toEqual(VALUE_UNCHANGED);
});

it('can set participant scaleItems in bulk', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 100 },
  });
  const { participants } = tournamentRecord;
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

  let {
    tournamentRecord: { participants: modifiedParticipants },
  } = tournamentEngine.getState();

  modifiedParticipants.forEach((participant) => {
    expect(participant.timeItems.length).toEqual(2);
  });

  tournamentEngine.setParticipantScaleItems({
    scaleItemsWithParticipantIds,
  });

  ({
    tournamentRecord: { participants: modifiedParticipants },
  } = tournamentEngine.getState());

  modifiedParticipants.forEach((participant) => {
    expect(participant.timeItems.length).toEqual(2);
  });
});
