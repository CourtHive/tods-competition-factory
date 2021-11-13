import { getParticipantId } from '../../../global/functions/extractors';
import { generateRange, unique } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { DOUBLES, SINGLES } from '../../../constants/eventConstants';
import { AD_HOC } from '../../../constants/drawDefinitionConstants';

const getParticipantType = (eventType) =>
  eventType === SINGLES ? INDIVIDUAL : eventType === DOUBLES ? PAIR : undefined;

const scenarios = [
  { eventType: SINGLES, drawSize: 5, roundsCount: 5 },
  { eventType: SINGLES, drawSize: 6, roundsCount: 3 },
  { eventType: SINGLES, drawSize: 8, roundsCount: 3 },
  { eventType: SINGLES, drawSize: 10, roundsCount: 3 },
  { eventType: DOUBLES, drawSize: 10 },
];

it.each(scenarios)(
  'can generate AD_HOC with arbitrary drawSizes and assign positions',
  (scenario) => {
    const { drawSize, eventType } = scenario;

    const {
      tournamentRecord,
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        { drawSize, drawType: AD_HOC, eventType, drawMatic: true },
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

    for (const roundNumber of generateRange(2, scenario.roundsCount + 1 || 2)) {
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
      let pairings = matchUps.map(({ sides }) =>
        sides.map(getParticipantId).sort().join('|')
      );
      let uniquePairings = unique(pairings);
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
          { drawType: AD_HOC, drawSize, drawMatic: true, roundsCount },
        ],
      },
    ];
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      participantsProfile: { idPrefix: 'P' },
      eventProfiles,
    });

    tournamentEngine.setState(tournamentRecord);

    const matchUpsPerRound = Math.floor(drawSize / 2);
    let { matchUps } = tournamentEngine.allTournamentMatchUps();
    expect(matchUps.length).toEqual(matchUpsPerRound * roundsCount);
  }
);
