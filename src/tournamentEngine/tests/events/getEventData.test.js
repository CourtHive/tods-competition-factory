import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { MISSING_EVENT } from '../../../constants/errorConditionConstants';
import { COMPASS } from '../../../constants/drawDefinitionConstants';
import { TEAM } from '../../../constants/participantTypes';
import { SINGLES } from '../../../constants/matchUpTypes';

it('returns eventData with expected drawsData', () => {
  const drawProfiles = [{ drawSize: 4, drawType: COMPASS }];
  const {
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine.getEventData();
  expect(result.error).toEqual(MISSING_EVENT);

  const { eventData } = tournamentEngine.getEventData({ eventId });
  expect(eventData.drawsData[0].structures.length).toEqual(2);
  expect(eventData.drawsData[0].updatedAt).not.toBeUndefined();
});

it('returns eventData when there is no drawsData', () => {
  const eventProfiles = [{ eventName: 'Test Event' }];
  const {
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    eventProfiles,
  });
  const { eventData } = tournamentEngine
    .setState(tournamentRecord)
    .getEventData({ eventId });
  expect(eventData.drawsData.length).toEqual(0);

  const { event } = tournamentEngine.getEvent({ eventId });
  expect(event.drawDefinitions).toBeUndefined();
});

it('returns team information for participants in SINGLES and DOUBLES matchUps in non-TEAM events', () => {
  const mockProfile = {
    participantsProfile: {
      teamKey: { personAttribute: 'nationalityCode' },
      nationalityCodesCount: 10,
      participantsCount: 32,
    },
    drawProfiles: [{ drawSize: 32 }],
  };
  const {
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord(mockProfile);

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants: teamParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [TEAM] },
    });
  expect(teamParticipants.length).toBeGreaterThan(0);

  const { eventData } = tournamentEngine.getEventData({ eventId });
  expect(eventData.drawsData[0].structures.length).toEqual(1);

  eventData.drawsData[0].structures[0].roundMatchUps[1].forEach((matchUp) => {
    expect(matchUp.matchUpType).toEqual(SINGLES);

    // expect that each individual participant on the team also has team information
    matchUp.sides.forEach((side) => {
      expect(side.participant.teams.length).toEqual(1);
      expect(side.participant.groups.length).toEqual(0);
    });
  });
});
