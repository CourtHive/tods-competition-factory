import { countries } from '@Fixtures/countryData';
import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, it } from 'vitest';

// constants
import { INVALID_VALUES } from '@Constants/errorConditionConstants';
import { COMPASS } from '@Constants/drawDefinitionConstants';
import { TEAM } from '@Constants/participantConstants';
import { DOUBLES } from '@Constants/eventConstants';
import { SINGLES } from '@Constants/matchUpTypes';

it('returns eventData with expected drawsData', () => {
  const drawProfiles = [{ drawSize: 4, drawType: COMPASS }];
  const {
    eventIds: [eventId],
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    setState: true,
    drawProfiles,
  });

  let result = tournamentEngine.devContext(true).modifyDrawName({
    drawName: 'This is a Draw',
    eventId,
    drawId,
  });
  expect(result.success).toEqual(true);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.updatedAt).not.toBeUndefined();

  result = tournamentEngine.getEventData();
  expect(result.error).toEqual(INVALID_VALUES);

  let eventData = tournamentEngine.getEventData({ eventId }).eventData;
  expect(eventData.drawsData[0].structures.length).toEqual(2);
  expect(eventData.drawsData[0].updatedAt).not.toBeUndefined();

  eventData = tournamentEngine.getEventData({ eventId, usePublishState: true }).eventData;
  expect(eventData.eventInfo.published).toEqual(false);
  expect(eventData.drawsData).toBeUndefined();

  result = tournamentEngine.publishEvent({ eventId });
  expect(result.success).toEqual(true);

  eventData = tournamentEngine.getEventData({ eventId, usePublishState: true }).eventData;
  expect(eventData.eventInfo.published).toEqual(true);
  expect(eventData.drawsData.length).toEqual(1);

  result = tournamentEngine.unPublishEvent({ eventId });
  expect(result.success).toEqual(true);

  eventData = tournamentEngine.getEventData({ eventId, usePublishState: true }).eventData;
  expect(eventData.eventInfo.published).toEqual(false);
  expect(eventData.drawsData).toBeUndefined();
});

it('returns eventData when there is no drawsData', () => {
  const eventProfiles = [{ eventName: 'Test Event' }];
  const {
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    eventProfiles,
  });
  const { eventData } = tournamentEngine.setState(tournamentRecord).getEventData({ eventId });
  expect(eventData.drawsData.length).toEqual(0);

  const { event } = tournamentEngine.getEvent({ eventId });
  expect(event.drawDefinitions).toEqual([]);
});

it('returns team information for participants in SINGLES and DOUBLES matchUps in non-TEAM events', () => {
  const isoWithIOC = countries.filter(({ ioc }) => ioc).map(({ iso }) => iso);
  const mockProfile = {
    participantsProfile: {
      teamKey: { personAttribute: 'nationalityCode' },
      nationalityCodesCount: 10,
      participantsCount: 32,
    },
    drawProfiles: [{ drawSize: 32 }, { drawSize: 8, eventType: DOUBLES }],
  };
  const {
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord(mockProfile);

  tournamentEngine.setState(tournamentRecord);

  const { participants: teamParticipants } = tournamentEngine.getParticipants({
    participantFilters: { participantTypes: [TEAM] },
  });
  expect(teamParticipants.length).toBeGreaterThan(0);

  const { eventData } = tournamentEngine.getEventData({
    participantsProfile: { withIOC: true, withISO2: true },
    eventId,
  });
  expect(eventData.drawsData[0].structures.length).toEqual(1);

  let iocCount = 0;
  eventData.drawsData[0].structures[0].roundMatchUps[1].forEach((matchUp) => {
    expect(matchUp.matchUpType).toEqual(SINGLES);

    // expect that each individual participant on the team also has team information
    matchUp.sides.forEach((side) => {
      expect(side.participant.person.iso2NationalityCode).not.toBeUndefined();
      if (isoWithIOC.includes(side.participant.person.nationalityCode)) {
        expect(side.participant.person.iocNationalityCode).not.toBeUndefined();
        iocCount += 1;
      }
      expect(side.participant.teams.length).toEqual(1);
      expect(side.participant.groups.length).toEqual(0);
    });
  });
  expect(iocCount).toBeGreaterThan(0);

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    participantsProfile: { withIOC: true, withISO2: true },
  });

  iocCount = 0;
  matchUps
    .filter(({ readyToScore }) => readyToScore)
    .forEach(({ sides }) => {
      const persons = sides
        .map(
          ({ participant }) => participant?.person || participant?.individualParticipants.map(({ person }) => person),
        )
        .flat()
        .filter(Boolean);
      persons.forEach((person) => {
        expect(person.iso2NationalityCode).not.toBeUndefined();
        if (isoWithIOC.includes(person.nationalityCode)) {
          expect(person.iocNationalityCode).not.toBeUndefined();
          iocCount += 1;
        }
      });
    });
  expect(iocCount).toBeGreaterThan(0);
});
