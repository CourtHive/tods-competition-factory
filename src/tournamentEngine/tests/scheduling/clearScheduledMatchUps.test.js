import { getStructureRoundProfile } from '../../../drawEngine/getters/getMatchUps/getStructureRoundProfile';
import mocksEngine from '../../../mocksEngine';
import { tournamentEngine } from '../../sync';

import { resultConstants } from '../../../constants/resultConstants';
import { eventConstants } from '../../../constants/eventConstants';

import SEEDING_ITF_POLICY from '../../../fixtures/policies/POLICY_SEEDING_ITF';

const { SINGLES } = eventConstants;
const { SUCCESS } = resultConstants;

it('can clear matchUp schedules', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    startDate: '2020-01-01',
    endDate: '2020-01-06',
  });
  const { participants } = tournamentRecord;

  tournamentEngine.setState(tournamentRecord);

  const myCourts = { venueName: 'My Courts' };
  let result = tournamentEngine
    .devContext({ addVenue: true })
    .addVenue({ venue: myCourts });
  const {
    venue: { venueId },
  } = result;
  expect(result.success).toEqual(true);

  const event = {
    eventName: 'Test Event',
    eventType: SINGLES,
  };

  result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    seedsCount: 8,
    event: eventResult,
    policyDefinitions: [SEEDING_ITF_POLICY],
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  const { structureId } = drawDefinition.structures[0];
  const { roundMatchUps } = getStructureRoundProfile({
    drawDefinition,
    structureId,
  });

  const matchUpIds = roundMatchUps[1].map((matchUp) => matchUp.matchUpId);

  let schedule = {
    scheduledTime: '08:00',
    scheduledDate: '2021-01-01',
    venueId,
  };
  result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.success).toEqual(true);

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  let matchUpsWithScheduledTime = matchUps.filter(
    (matchUp) => matchUp.schedule?.scheduledTime
  );

  expect(matchUpsWithScheduledTime.length).toEqual(matchUpIds.length);

  result = tournamentEngine.clearScheduledMatchUps();

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  matchUpsWithScheduledTime = matchUps.filter(
    (matchUp) => matchUp.schedule?.scheduledTime
  );
  expect(matchUpsWithScheduledTime.length).toEqual(0);
});
