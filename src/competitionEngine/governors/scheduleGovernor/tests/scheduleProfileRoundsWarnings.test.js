import tournamentEngine from '../../../../tournamentEngine/sync';
import { intersection } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';

import POLICY_SCHEDULING_USTA from '../../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import { SINGLE_ELIMINATION } from '../../../../constants/drawDefinitionConstants';

it.each([
  {
    drawSize: 4,
    drawType: SINGLE_ELIMINATION,
    roundNumbers: [1, 2],
    expectedErrors: 0,
  },
  {
    drawSize: 4,
    drawType: SINGLE_ELIMINATION,
    roundNumbers: [2, 1],
    expectedErrors: 1,
  },
  {
    drawSize: 16,
    drawType: SINGLE_ELIMINATION,
    roundNumbers: [1, 2, 3, 4],
    expectedErrors: 0,
  },
  {
    drawSize: 16,
    drawType: SINGLE_ELIMINATION,
    roundNumbers: [1, 2, 4, 3],
    expectedErrors: 1,
  },
  {
    drawSize: 16,
    drawType: SINGLE_ELIMINATION,
    roundNumbers: [1, 4, 2, 3],
    expectedErrors: 1,
  },
  {
    drawSize: 16,
    drawType: SINGLE_ELIMINATION,
    roundNumbers: [1, 3, 2, 4],
    expectedErrors: 2,
  },
])(
  'can clear scheduled matchUps',
  ({ drawSize, drawType, roundNumbers, expectedErrors }) => {
    const venueProfiles = [
      {
        startTime: '08:00',
        endTime: '19:00',
        courtsCount: 4,
      },
    ];

    const eventProfiles = [
      {
        eventExtensions: [],
        eventAttributes: {},
        eventName: 'Event Test',
        drawProfiles: [
          {
            drawSize,
            drawType,
          },
        ],
      },
    ];
    const startDate = '2022-01-01';
    const endDate = '2022-01-07';
    const {
      drawIds,
      venueIds: [venueId],
      tournamentRecord,
    } = mocksEngine.generateTournamentRecord({
      eventProfiles,
      venueProfiles,
      startDate,
      endDate,
    });

    competitionEngine.setState(tournamentRecord);

    competitionEngine.attachPolicies({
      policyDefinitions: POLICY_SCHEDULING_USTA,
    });

    const { tournamentId } = tournamentRecord;

    const drawId = drawIds[0];
    for (const roundNumber of roundNumbers) {
      const {
        event: { eventId },
        drawDefinition: {
          structures: [{ structureId }],
        },
      } = tournamentEngine.getEvent({ drawId });
      const result = competitionEngine.addSchedulingProfileRound({
        scheduleDate: startDate,
        venueId,
        round: { tournamentId, eventId, drawId, structureId, roundNumber },
      });
      expect(result.success).toEqual(true);
    }

    const { schedulingProfile } = competitionEngine.getSchedulingProfile();
    const rounds = schedulingProfile[0].venues[0].rounds;
    let { orderedMatchUpIds } = competitionEngine.getScheduledRoundsDetails({
      rounds,
    });
    const { matchUpDependencies } = competitionEngine.getMatchUpDependencies();

    const schedulingErrors = [];
    orderedMatchUpIds.forEach((matchUpId, index) => {
      const followingMatchUpIds = orderedMatchUpIds.slice(index + 1);
      const orderErrors = intersection(
        followingMatchUpIds,
        matchUpDependencies[matchUpId]
      );
      if (orderErrors.length)
        schedulingErrors.push({ [matchUpId]: orderErrors });
    });
    expect(schedulingErrors.length).toEqual(expectedErrors);
  }
);
