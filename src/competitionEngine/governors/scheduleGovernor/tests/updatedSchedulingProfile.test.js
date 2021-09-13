import { checkSchedulingProfile } from '../../../../tournamentEngine/governors/scheduleGovernor/schedulingProfile';
import { getUpdatedSchedulingProfile } from '../schedulingProfile/schedulingProfile';
import { mocksEngine, tournamentEngine } from '../../../..';
import competitionEngine from '../../../sync';

import { SCHEDULING_PROFILE } from '../../../../constants/extensionConstants';
import {
  INVALID_DATE,
  INVALID_VALUES,
} from '../../../../constants/errorConditionConstants';

it('can update a schedulingProfile when venues change', () => {
  const drawProfiles = [{ drawSize: 16 }];
  const venueProfiles = [
    { venueName: 'venue 1', courtsCount: 4 },
    { venueName: 'venue 2', courtsCount: 8 },
  ];
  const { tournamentRecord, venueIds, eventIds, drawIds } =
    mocksEngine.generateTournamentRecord({
      drawProfiles,
      venueProfiles,
      startDate: '2022-01-01',
      endDate: '2022-01-07',
    });

  competitionEngine.setState(tournamentRecord);

  const {
    matchUps: [matchUp],
  } = competitionEngine.allCompetitionMatchUps();
  const { tournamentId, eventId, drawId, structureId } = matchUp;

  let result = competitionEngine.addSchedulingProfileRound({
    scheduleDate: '2022-01-03',
    venueId: venueIds[0],
    round: { tournamentId, eventId, drawId, structureId, roundNumber: 1 },
  });
  expect(result.success).toEqual(true);

  result = competitionEngine.addSchedulingProfileRound({
    scheduleDate: '2022-01-03',
    venueId: venueIds[1],
    round: { tournamentId, eventId, drawId, structureId, roundNumber: 2 },
  });
  expect(result.success).toEqual(true);

  let { schedulingProfile, modifications, issues } =
    competitionEngine.getSchedulingProfile();

  expect(modifications).toEqual(0);
  expect(issues).toBeUndefined();
  expect(schedulingProfile.length).toEqual(1);
  expect(schedulingProfile[0].venues.length).toEqual(2);

  result = competitionEngine.addSchedulingProfileRound({
    scheduleDate: 'badDate',
    venueId: venueIds[1],
    round: { tournamentId, eventId, drawId, structureId, roundNumber: 3 },
  });
  expect(result.error).toEqual(INVALID_DATE);

  result = competitionEngine.addSchedulingProfileRound({
    scheduleDate: '2022-01-03',
    venueId: venueIds[0],
    round: {
      tournamentId,
      eventId,
      drawId: 'bogusId',
      structureId,
      roundNumber: 3,
    },
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = competitionEngine.deleteVenue({ venueId: venueIds[0] });
  expect(result.success).toEqual(true);

  ({ schedulingProfile, modifications, issues } =
    competitionEngine.getSchedulingProfile());

  expect(modifications).toEqual(0);
  expect(issues).toBeUndefined();
  expect(schedulingProfile.length).toEqual(1);
  expect(schedulingProfile[0].venues.length).toEqual(1);

  const badDateProfile = Object.assign({}, schedulingProfile[0], {
    scheduleDate: 'Invalid Date',
  });
  schedulingProfile.push(badDateProfile);

  result = getUpdatedSchedulingProfile({
    schedulingProfile,
    venueIds,
    eventIds,
    drawIds,
  });

  expect(result.modifications).toEqual(1);
  expect(result.issues.length).toEqual(1);
  expect(result.updatedSchedulingProfile.length).toEqual(1);
  expect(result.updatedSchedulingProfile[0].venues.length).toEqual(1);

  result = getUpdatedSchedulingProfile({
    schedulingProfile,
    venueIds: [],
    eventIds,
    drawIds,
  });

  expect(result.modifications).toEqual(2);
  expect(result.issues.length).toEqual(2);
  expect(result.updatedSchedulingProfile.length).toEqual(0);

  result = getUpdatedSchedulingProfile({
    schedulingProfile,
    venueIds,
    eventIds: [],
    drawIds,
  });

  expect(result.modifications).toEqual(2);
  expect(result.issues.length).toEqual(2);
  expect(result.updatedSchedulingProfile.length).toEqual(0);

  const extension = {
    name: SCHEDULING_PROFILE,
    value: schedulingProfile,
  };
  result = tournamentEngine.addTournamentExtension({ extension });
  expect(result.success).toEqual(true);

  result = tournamentEngine.getSchedulingProfile();
  expect(result.modifications).toEqual(1);
  expect(result.issues.length).toEqual(1);
  expect(result.schedulingProfile.length).toEqual(1);

  result = tournamentEngine.addTournamentExtension({ extension });
  expect(result.success).toEqual(true);

  result = checkSchedulingProfile({ schedulingProfile });
  expect(result.modifications).toEqual(2);

  result = tournamentEngine.getSchedulingProfile();
  result = checkSchedulingProfile({
    schedulingProfile: result.schedulingProfile,
  });
  expect(result.modifications).toEqual(1);

  const { tournamentRecord: snapshot } = tournamentEngine.getState();
  result = checkSchedulingProfile({ tournamentRecord: snapshot });
  expect(result.modifications).toEqual(0);
});
