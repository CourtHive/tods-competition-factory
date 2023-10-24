import tournamentEngine from '../../tournamentEngine/sync';
import { getAccessorValue } from '../getAccessorValue';
import mocksEngine from '../../mocksEngine';
import { expect, test } from 'vitest';

import { INDIVIDUAL, PAIR } from '../../constants/participantConstants';
import { DOUBLES, SINGLES } from '../../constants/matchUpTypes';
import { MALE } from '../../constants/genderConstants';

test('accessorValues can target person.sex when participantType: PAIR', () => {
  const drawProfiles = [
    {
      category: { ratingType: 'WTN', ratingMin: 8, ratingMax: 12 },
      eventName: `WTN 8-12 DOUBLES`,
      eventType: DOUBLES,
      drawSize: 32,
      gender: MALE,
    },
    {
      category: { ratingType: 'WTN', ratingMin: 8, ratingMax: 12 },
      eventName: `WTN 8-12 SINGLES`,
      eventType: SINGLES,
      drawSize: 32,
      gender: MALE,
    },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  tournamentEngine.setState(tournamentRecord);

  const participantWithTimeItems = tournamentRecord.participants.find(
    (participant) =>
      participant.participantType === INDIVIDUAL &&
      participant.timeItems?.length
  );
  expect(participantWithTimeItems.ratings).toBeUndefined();

  const { participants } = tournamentEngine.getParticipants({
    withIndividualParticipants: true,
    convertExtensions: true,
    withScaleValues: true,
  });

  const ratedParticipant = participants.find(
    (p) =>
      p.participantType === PAIR &&
      p.individualParticipants &&
      p.individualParticipants[0].timeItems
  );
  for (const participant of ratedParticipant.individualParticipants) {
    expect(Object.keys(participant.ratings)).not.toBeUndefined();
  }

  let targetParticipant = participants.find(
    (participant) =>
      participant.participantId === participantWithTimeItems.participantId
  );
  expect(Object.keys(targetParticipant.ratings)).not.toBeUndefined();

  const { value, values } = getAccessorValue({
    element: participants[0],
    accessor: 'individualParticipants.person.sex',
  });
  expect(value).toEqual(MALE);
  expect(values).toEqual([MALE]);

  const state = tournamentEngine.getState();
  targetParticipant = state.tournamentRecord.participants.find(
    (participant) =>
      participant.participantId === participantWithTimeItems.participantId
  );
  expect(targetParticipant.ratings).toBeUndefined();
});
