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
  { eventType: SINGLES, drawSize: 5, rounds: 5 },
  { eventType: SINGLES, drawSize: 6, rounds: 3 },
  { eventType: SINGLES, drawSize: 8, rounds: 3 },
  { eventType: SINGLES, drawSize: 10, rounds: 3 },
  // { eventType: DOUBLES, drawSize: 10 },
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

    for (const roundNumber of generateRange(2, scenario.rounds + 1 || 2)) {
      const result = tournamentEngine.drawMatic({
        restrictEntryStatus: true,
        drawId,
      });
      expect(result.success).toEqual(true);

      const { matchUps } = tournamentEngine.allTournamentMatchUps();
      expect(matchUps.length).toEqual(Math.floor(drawSize / 2) * roundNumber); // # participants is half drawSize * roundNumber
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

test.skip('DrawMatic events can be generated using eventProfiles', () => {
  const drawSize = 4;
  const eventProfiles = [
    {
      eventType: 'DOUBLES',
      drawProfiles: [{ drawType: AD_HOC, drawSize }],
    },
  ];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    eventProfiles,
    participantsProfile: { idPrefix: 'P' },
  });

  tournamentEngine.setState(tournamentRecord);
  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const structureId = drawDefinition.structures[0].structureId;

  let result = tournamentEngine.drawMatic({
    restrictEntryStatus: true,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);
  /*

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  expect(matchUps.length).toEqual(Math.floor(drawSize / 2));
  */
});
