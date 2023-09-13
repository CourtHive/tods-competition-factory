import { getParticipantId } from '../../../global/functions/extractors';
import { generateRange, makeDeepCopy, unique } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { INDIVIDUAL, PAIR } from '../../../constants/participantConstants';
import { DOUBLES, SINGLES } from '../../../constants/eventConstants';
import { AD_HOC } from '../../../constants/drawDefinitionConstants';
import {
  EXISTING_MATCHUP_ID,
  MISSING_PARTICIPANT_IDS,
} from '../../../constants/errorConditionConstants';

const getParticipantType = (eventType) =>
  (eventType === SINGLES && INDIVIDUAL) || (eventType === DOUBLES && PAIR);

const scenarios = [
  { eventType: SINGLES, drawSize: 5, roundsCount: 5 },
  { eventType: SINGLES, drawSize: 6, roundsCount: 3 },
  { eventType: SINGLES, drawSize: 8, roundsCount: 3 },
  { eventType: SINGLES, drawSize: 10, roundsCount: 3 },
  { eventType: DOUBLES, drawSize: 10 },
];

it.each(scenarios)(
  'can generate AD_HOC with arbitrary drawSizes',
  (scenario) => {
    const { drawSize, eventType } = scenario;

    const {
      tournamentRecord,
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          drawType: AD_HOC,
          automated: true,
          roundsCount: 1,
          eventType,
          drawSize,
        },
      ],
      participantsProfile: { idPrefix: 'P' },
    });

    tournamentEngine.setState(tournamentRecord);

    const { matchUps } = tournamentEngine.allTournamentMatchUps();
    expect(matchUps.length).toEqual(Math.floor(drawSize / 2));
    expect(matchUps[0].sides[0].participant.participantType).toEqual(
      getParticipantType(scenario.eventType)
    );
    expect(matchUps[0].sides[0].participant.participantId.slice(0, 4)).toEqual(
      eventType === SINGLES ? 'P-I-' : 'P-P-'
    );

    for (const roundNumber of generateRange(
      2,
      (scenario?.roundsCount || 0) + 1 || 2
    )) {
      const result = tournamentEngine.drawMatic({
        restrictEntryStatus: true,
        generateMatchUps: true, // without this it will only generate { participantIdPairings }
        drawId,
      });
      expect(result.success).toEqual(true);

      const matchUpsPerRound = Math.floor(drawSize / 2);
      const { matchUps } = tournamentEngine.allTournamentMatchUps();
      expect(matchUps.length).toEqual(matchUpsPerRound * roundNumber); // # participants is half drawSize * roundNumber
      expect(matchUps[matchUps.length - 1].roundNumber).toEqual(roundNumber);

      // now get all matchUp.sides => participantIds and ensure all pairings are unique
      // e.g. participants did not play the same opponent
      const pairings = matchUps.map(({ sides }) =>
        sides.map(getParticipantId).sort().join('|')
      );
      const uniquePairings = unique(pairings);
      if (roundNumber < (drawSize % 2 ? drawSize - 1 : drawSize)) {
        expect(pairings.length - uniquePairings.length).toEqual(0);
      }
    }
  }
);

it.each(scenarios)(
  'DrawMatic events can be generated using eventProfiles',
  (scenario) => {
    const { drawSize, eventType, roundsCount = 1 } = scenario;
    const eventProfiles = [
      {
        eventType,
        drawProfiles: [
          { drawType: AD_HOC, drawSize, automated: true, roundsCount },
        ],
      },
    ];
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      participantsProfile: { idPrefix: 'P' },
      eventProfiles,
    });

    tournamentEngine.setState(tournamentRecord);

    const matchUpsPerRound = Math.floor(drawSize / 2);
    const { matchUps } = tournamentEngine.allTournamentMatchUps();
    expect(matchUps.length).toEqual(matchUpsPerRound * roundsCount);
    const roundNames = matchUps.map((m) => m.roundName);
    roundNames.forEach((roundName) => expect(roundName[0]).toEqual('R'));
  }
);

it('can use drawMatic to generate rounds in existing AD_HOC draws', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 20 },
  });

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } =
    tournamentEngine.getTournamentParticipants();

  const {
    event: { eventId },
  } = tournamentEngine.addEvent({
    event: { eventName: 'Match Play' },
  });

  const participantIds = tournamentParticipants.map((p) => p.participantId);
  let result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  result = tournamentEngine.generateDrawDefinition({
    drawSize: participantIds.length,
    addToEvent: true,
    drawType: AD_HOC,
    eventId,
  });

  expect(result.success).toEqual(true);

  const { drawId } = result.drawDefinition;
  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  expect(matchUps.length).toEqual(0);

  result = tournamentEngine.drawMatic({ drawId });
  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  expect(matchUps.length).toEqual(10);

  result = tournamentEngine.drawMatic({ drawId });
  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  expect(matchUps.length).toEqual(20);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { roundNumbers: [2] },
  }));
  expect(matchUps.length).toEqual(10);

  // will not add matchUps to structure
  result = tournamentEngine.drawMatic({ drawId, addToStructure: false });
  expect(result.matchUps.length).toEqual(10);

  // number of matchUps will not have changed
  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  expect(matchUps.length).toEqual(20);

  const matchUpsToAdd = makeDeepCopy(result.matchUps);

  result = tournamentEngine.addAdHocMatchUps({
    matchUps: matchUpsToAdd,
    drawId,
  });
  expect(result.success).toEqual(true);

  // number of matchUps will be greater
  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  expect(matchUps.length).toEqual(30);

  result = tournamentEngine.addAdHocMatchUps({
    matchUps: matchUpsToAdd,
    drawId,
  });
  expect(result.error).toEqual(EXISTING_MATCHUP_ID);

  // number of matchUps will not have changed
  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  expect(matchUps.length).toEqual(30);
});

it('cannot use drawMatic when there are no entries present', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 20 },
  });

  tournamentEngine.setState(tournamentRecord);

  const {
    event: { eventId },
  } = tournamentEngine.addEvent({
    event: { eventName: 'Match Play' },
  });

  let result = tournamentEngine.generateDrawDefinition({
    drawType: AD_HOC,
    addToEvent: true,
    eventId,
  });

  expect(result.success).toEqual(true);

  const { drawId } = result.drawDefinition;
  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  expect(matchUps.length).toEqual(0);

  result = tournamentEngine.drawMatic({ drawId });
  expect(result.error).toEqual(MISSING_PARTICIPANT_IDS);
});
