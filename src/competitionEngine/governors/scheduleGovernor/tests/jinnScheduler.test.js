import { hasSchedule } from '../scheduleMatchUps/hasSchedule';
import { extractTime } from '../../../../utilities/dateTime';
import { mocksEngine, tournamentEngine } from '../../../..';
import { unique } from '../../../../utilities';

import POLICY_SCHEDULING_NO_DAILY_LIMITS from '../../../../fixtures/policies/POLICY_SCHEDULING_NO_DAILY_LIMITS';
import { FEMALE, MALE } from '../../../../constants/genderConstants';
import { DOUBLES } from '../../../../constants/eventConstants';
import {
  CONSOLATION,
  FEED_IN_CHAMPIONSHIP_TO_R16,
  MAIN,
} from '../../../../constants/drawDefinitionConstants';

it.each([
  {
    jinn: true,
    rounds: [
      { drawId: 'idM16', winnerFinishingPositionRange: '1-16' },
      { drawId: 'idF16', winnerFinishingPositionRange: '1-16' },
      { drawId: 'idM18', winnerFinishingPositionRange: '1-16' },
      { drawId: 'idM16', winnerFinishingPositionRange: '9-24' }, // schedule CONSOLATION rounds before 2nd rounds MAIN
      { drawId: 'idF16', winnerFinishingPositionRange: '9-24' },
      { drawId: 'idM18', winnerFinishingPositionRange: '9-24' },
      { drawId: 'idM16', winnerFinishingPositionRange: '1-8' }, // schedule 2nd rounds MAIN after 1st rounds CONSOLATION
      { drawId: 'idF16', winnerFinishingPositionRange: '1-8' },
      { drawId: 'idM18', winnerFinishingPositionRange: '1-8' },
    ],
    dependencyDeferredCount: 0,
    recoveryDeferredCount: 446,
    timeProfiles: {
      idM16: {
        main1st: ['08:00'],
        main2nd: ['10:30', '11:00'],
        consolation1st: ['10:00'],
      },
    },
  },
])(
  'can schedule potential rounds properly in scenarios with recovery times greater than average matchUp times',
  ({
    dependencyDeferredCount,
    recoveryDeferredCount,
    timeProfiles,
    rounds,
    jinn,
  }) => {
    const firstVenueId = 'firstVenueId';
    const venueProfiles = [
      { venueId: firstVenueId, courtsCount: 31, startTime: '08:00' },
    ];
    const withPlayoffs = {
      roundProfiles: [{ 3: 1 }, { 4: 1 }],
      playoffAttributes: {
        '0-3': { name: 'Silver', abbreviation: 'S' },
        '0-4': { name: 'Gold', abbreviation: 'G' },
      },
    };
    const drawProfiles = [
      {
        drawType: FEED_IN_CHAMPIONSHIP_TO_R16,
        drawName: 'U16 Boys Doubles',
        uniqueParticipants: true,
        participantsCount: 32,
        eventType: DOUBLES,
        idPrefix: 'M16',
        drawId: 'idM16',
        gender: MALE,
        drawSize: 32,
        withPlayoffs,
      },
      {
        drawType: FEED_IN_CHAMPIONSHIP_TO_R16,
        drawName: 'U16 Girls Doubles',
        uniqueParticipants: true,
        participantsCount: 32,
        eventType: DOUBLES,
        idPrefix: 'F16',
        drawId: 'idF16',
        gender: FEMALE,
        drawSize: 32,
        withPlayoffs,
      },
      {
        drawType: FEED_IN_CHAMPIONSHIP_TO_R16,
        drawName: 'U18 Boys Doubles',
        uniqueParticipants: true,
        participantsCount: 24,
        eventType: DOUBLES,
        idPrefix: 'M18',
        drawId: 'idM18',
        gender: MALE,
        drawSize: 32,
        withPlayoffs,
      },
    ];

    const startDate = '2022-01-01';

    const schedulingProfile = [
      {
        scheduleDate: startDate,
        venues: [
          {
            venueId: firstVenueId,
            rounds,
          },
        ],
      },
    ];

    const policyDefinitions = POLICY_SCHEDULING_NO_DAILY_LIMITS;
    const { tournamentRecord, schedulerResult } =
      mocksEngine.generateTournamentRecord({
        autoSchedule: true,
        policyDefinitions,
        schedulingProfile,
        venueProfiles,
        drawProfiles,
        startDate,
        jinn,
      });

    tournamentEngine.setState(tournamentRecord);

    const dependency =
      schedulerResult.dependencyDeferredMatchUpIds?.[startDate];
    const recovery =
      schedulerResult.recoveryTimeDeferredMatchUpIds?.[startDate];

    if (jinn) {
      expect(dependency).not.toBeUndefined();
      expect(recovery).not.toBeUndefined();
      expect(schedulerResult.jinn).toEqual(true);
    }

    const dependencyDeferred =
      dependency &&
      Object.keys(dependency)
        .map((key) =>
          dependency[key].map(
            ({ scheduleTime, remainingDependencies }) =>
              `${key} => ${scheduleTime}: ${remainingDependencies.join('|')}`
          )
        )
        .flat();
    const recoveryDeferred =
      recovery &&
      Object.keys(recovery)
        .map((key) =>
          recovery[key].map(({ scheduleTime }) => `${key} => ${scheduleTime}`)
        )
        .flat();
    dependency &&
      expect(dependencyDeferredCount).toEqual(dependencyDeferred.length);
    recovery && expect(recoveryDeferredCount).toEqual(recoveryDeferred.length);

    const { matchUps } = tournamentEngine.allTournamentMatchUps();
    const scheduledMatchUps = matchUps.filter(hasSchedule);

    // 1st round matchUps = 16 + 16 + 8 = 40
    // 2nd round matchUps = 8 + 8 + 8 = 24
    // 1st round consolation matchUps = 8 + 8 + 0 = 16
    expect(scheduledMatchUps.length).toEqual(80);

    const main1stRound = scheduledMatchUps.filter(
      ({ structureName, roundNumber }) =>
        structureName === MAIN && roundNumber === 1
    );
    const main2ndRound = scheduledMatchUps.filter(
      ({ structureName, roundNumber }) =>
        structureName === MAIN && roundNumber === 2
    );
    expect(main1stRound.length).toEqual(40);
    expect(main2ndRound.length).toEqual(24);

    const consolationMatchUps = scheduledMatchUps.filter(
      ({ structureName }) => structureName === CONSOLATION
    );
    expect(consolationMatchUps.length).toEqual(16);

    Object.keys(timeProfiles).forEach((profileDrawId) => {
      const main1st = unique(
        main1stRound
          .filter(({ drawId }) => drawId === profileDrawId)
          .map(({ schedule }) => extractTime(schedule.scheduledTime))
      );
      expect(timeProfiles[profileDrawId].main1st).toEqual(main1st);
      const main2nd = unique(
        main2ndRound
          .filter(({ drawId }) => drawId === profileDrawId)
          .map(({ schedule }) => extractTime(schedule.scheduledTime))
      );
      expect(timeProfiles[profileDrawId].main2nd).toEqual(main2nd);
      const consolation1st = unique(
        consolationMatchUps
          .filter(({ drawId }) => drawId === profileDrawId)
          .map(({ schedule }) => extractTime(schedule.scheduledTime))
      );
      expect(timeProfiles[profileDrawId].consolation1st).toEqual(
        consolation1st
      );
    });
  }
);
