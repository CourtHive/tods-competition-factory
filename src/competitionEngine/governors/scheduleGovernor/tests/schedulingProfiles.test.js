import tournamentEngine from '../../../../tournamentEngine/sync';
import competitionEngineSync from '../../../sync';
import mocksEngine from '../../../../mocksEngine';

import {
  INVALID_DATE,
  INVALID_VALUES,
  VENUE_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

test.each([competitionEngineSync])(
  'it can set scheulingProfile',
  async (competitionEngine) => {
    const drawProfiles = [{ drawSize: 16 }];
    const venueProfiles = [
      { venueName: 'venue 1', courtsCount: 4 },
      { venueName: 'venue 2', courtsCount: 8 },
    ];
    const { tournamentRecord: firstRecord } =
      mocksEngine.generateTournamentRecord({
        drawProfiles,
        venueProfiles,
        startDate: '2022-01-01',
        endDate: '2022-01-07',
      });
    const { tournamentRecord: secondRecord } =
      mocksEngine.generateTournamentRecord({
        startDate: '2022-01-02',
        endDate: '2022-01-10',
      });
    competitionEngine.setState([firstRecord, secondRecord]);

    let { startDate, endDate } = competitionEngine.getCompetitionDateRange();
    expect(startDate).toEqual('2022-01-01');
    expect(endDate).toEqual('2022-01-10');

    const { venues, venueIds } = competitionEngine.getCompetitionVenues();
    expect(venues.length).toEqual(2);
    expect(venueIds.length).toEqual(2);

    let { schedulingProfile, modifications, issues } =
      competitionEngine.getSchedulingProfile();
    expect(schedulingProfile).toEqual([]);

    let result = competitionEngine.addSchedulingProfileRound({
      scheduleDate: '2022-01-03',
      venueId: venueIds[0],
      round: { drawId: 'drawId' },
    });
    expect(result.error).toEqual(INVALID_VALUES);

    ({ schedulingProfile, modifications, issues } =
      competitionEngine.getSchedulingProfile());

    expect(schedulingProfile).toEqual([]);
    expect(modifications).toEqual(0);
    expect(issues).toEqual(undefined);

    const { matchUps } = competitionEngine.allCompetitionMatchUps();
    const { tournamentId, eventId, drawId, structureId, roundNumber } =
      matchUps[0];

    result = competitionEngine.addSchedulingProfileRound({
      scheduleDate: '2022-01-13',
      venueId: venueIds[0],
      round: { eventId, drawId },
    });
    expect(result.error).toEqual(INVALID_DATE);

    result = competitionEngine.addSchedulingProfileRound({
      scheduleDate: '2022-01-03',
      venueId: venueIds[0],
      round: { eventId, drawId },
    });
    expect(result.error).toEqual(INVALID_VALUES);

    result = competitionEngine.addSchedulingProfileRound({
      scheduleDate: '2022-01-03',
      venueId: venueIds[0],
      round: { tournamentId, eventId, drawId, structureId, roundNumber },
    });
    expect(result.success).toEqual(true);

    ({ schedulingProfile, modifications, issues } =
      competitionEngine.getSchedulingProfile());

    result = competitionEngine.isValidSchedulingProfile({ schedulingProfile });
    expect(result.valid).toEqual(true);

    // undefined { schedulingProfile } will remove all relevant extensions
    result = competitionEngine.setSchedulingProfile({});
    expect(result.success).toEqual(true);
    expect(result.removed).toEqual(2);

    result = competitionEngine.setSchedulingProfile({ schedulingProfile: {} });
    expect(result.error).toEqual(INVALID_VALUES);

    result = competitionEngine.setSchedulingProfile({ schedulingProfile: [] });
    expect(result.success).toEqual(true);

    result = competitionEngine.getVenuesAndCourts();
    expect(result.venues.length).toEqual(2);
    expect(result.courts.length).toEqual(12);

    result = tournamentEngine.setTournamentId(firstRecord.tournamentId);
    expect(result.success).toEqual(true);

    result = tournamentEngine.deleteVenues();
    expect(result.error).toEqual(INVALID_VALUES);
    result = tournamentEngine.deleteVenues({});
    expect(result.error).toEqual(INVALID_VALUES);
    result = tournamentEngine.deleteVenues({ venueIds: 'foo' });
    expect(result.error).toEqual(INVALID_VALUES);
    result = tournamentEngine.deleteVenues({ venueIds: [] });
    expect(result.success).toEqual(true);
    result = tournamentEngine.deleteVenues({ venueIds });
    expect(result.success).toEqual(true);

    result = competitionEngine.getVenuesAndCourts();
    expect(result.venues.length).toEqual(0);
    expect(result.courts.length).toEqual(0);

    result = tournamentEngine.setSchedulingProfile({});
    expect(result.error).toEqual(INVALID_VALUES);

    result = tournamentEngine.setSchedulingProfile({ schedulingProfile: {} });
    expect(result.error).toEqual(INVALID_VALUES);

    result = tournamentEngine.setSchedulingProfile({ schedulingProfile: [] });
    expect(result.success).toEqual(true);
  }
);

test.skip.each([competitionEngineSync])(
  'isValidSchedulingProfile can identify invalid schedulingProfiles',
  async (competitionEngine) => {
    const venueProfiles = [
      { venueName: 'venue 1', courtsCount: 4 },
      { venueName: 'venue 2', courtsCount: 8 },
    ];
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      venueProfiles,
      startDate: '2022-01-01',
      endDate: '2022-01-07',
    });
    competitionEngine.setState(tournamentRecord);
    const { venueIds } = competitionEngine.getCompetitionVenues();

    let result = competitionEngine.isValidSchedulingProfile({
      schedulingProfile: {},
    });
    expect(result.valid).toEqual(false);

    result = competitionEngine.isValidSchedulingProfile({
      schedulingProfile: [],
    });
    expect(result.valid).toEqual(true);

    result = competitionEngine.isValidSchedulingProfile({
      schedulingProfile: [[]],
    });
    expect(result.valid).toEqual(false);

    result = competitionEngine.isValidSchedulingProfile({
      schedulingProfile: [{ scheduleDate: '2022-01-03', venues: [] }],
    });
    expect(result.valid).toEqual(true);

    result = competitionEngine.isValidSchedulingProfile({
      schedulingProfile: [{ scheduleDate: '2022-01-03', venues: [{}] }],
    });
    expect(result.valid).toEqual(false);

    result = competitionEngine.isValidSchedulingProfile({
      schedulingProfile: [
        { scheduleDate: '2022-01-03', venues: [{ rounds: [] }] },
      ],
    });
    expect(result.valid).toEqual(false);

    result = competitionEngine.isValidSchedulingProfile({
      schedulingProfile: [
        {
          scheduleDate: '2022-01-03',
          venues: [{ venueId: venueIds[0], rounds: [] }],
        },
      ],
    });
    expect(result.valid).toEqual(true);

    result = competitionEngine.isValidSchedulingProfile({
      schedulingProfile: [
        {
          scheduleDate: '2022-01-03',
          venues: [{ venueId: 'bogusId', rounds: [] }],
        },
      ],
    });
    expect(result.error).toEqual(VENUE_NOT_FOUND);
    expect(result.valid).toEqual(false);
  }
);
