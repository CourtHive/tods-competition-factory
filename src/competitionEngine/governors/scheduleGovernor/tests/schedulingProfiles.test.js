import tournamentEngine from '../../../../tournamentEngine/sync';
import competitionEngineSync from '../../../sync';
import mocksEngine from '../../../../mocksEngine';

import {
  INVALID_DATE,
  INVALID_VALUES,
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

    result = competitionEngine.setSchedulingProfile({});
    expect(result.error).toEqual(INVALID_VALUES);

    result = competitionEngine.setSchedulingProfile({ schedulingProfile: {} });
    expect(result.error).toEqual(INVALID_VALUES);

    result = competitionEngine.setSchedulingProfile({ schedulingProfile: [] });
    expect(result.success).toEqual(true);

    result = tournamentEngine.setSchedulingProfile({});
    expect(result.error).toEqual(INVALID_VALUES);

    result = tournamentEngine.setSchedulingProfile({ schedulingProfile: {} });
    expect(result.error).toEqual(INVALID_VALUES);

    result = tournamentEngine.setSchedulingProfile({ schedulingProfile: [] });
    expect(result.success).toEqual(true);
  }
);
