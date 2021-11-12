import { getParticipantId } from '../../../global/functions/extractors';
import mocksEngine from '../../../mocksEngine';
import { unique } from '../../../utilities';
import tournamentEngine from '../../sync';

import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { DOUBLES, SINGLES } from '../../../constants/eventConstants';
import { AD_HOC } from '../../../constants/drawDefinitionConstants';

const getParticipantType = (eventType) =>
  eventType === SINGLES ? INDIVIDUAL : eventType === DOUBLES ? PAIR : undefined;

const scenarios = [
  // { eventType: SINGLES, drawSize: 8 },
  { eventType: SINGLES, drawSize: 10 },
  // { eventType: DOUBLES, drawSize: 10 },
];

it.each(scenarios)(
  'can generate AD_HOC with arbitrary drawSizes and assign positions',
  (scenario) => {
    // there are 10 entries into the generated event
    const { drawSize, eventType } = scenario;

    const {
      tournamentRecord,
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [{ drawSize, drawType: AD_HOC, eventType }],
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

    let { matchUps } = tournamentEngine.allTournamentMatchUps();
    expect(matchUps.length).toEqual(drawSize / 2);
    expect(matchUps[0].sides[0].participant.participantType).toEqual(
      getParticipantType(scenario.eventType)
    );
    expect(matchUps[0].sides[0].participant.participantId.slice(0, 4)).toEqual(
      eventType === SINGLES ? 'P-I-' : 'P-P-'
    );

    result = tournamentEngine.drawMatic({
      restrictEntryStatus: true,
      structureId,
      drawId,
    });
    expect(result.success).toEqual(true);

    ({ matchUps } = tournamentEngine.allTournamentMatchUps());
    expect(matchUps.length).toEqual((drawSize / 2) * 2); // # participants is half drawSize * roundNumber
    expect(matchUps[matchUps.length - 1].roundNumber).toEqual(2);

    // now get all matchUp.sides => participantIds and ensure all pairings are unique
    // e.g. participants did not play the same opponent
    let pairings = matchUps.map(({ sides }) =>
      sides.map(getParticipantId).sort().join('|')
    );
    let uniquePairings = unique(pairings);
    console.log(pairings.length, uniquePairings.length);
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
  } = mocksEngine.generateTournamentRecord({ eventProfiles });

  tournamentEngine.setState(tournamentRecord);
  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const structureId = drawDefinition.structures[0].structureId;

  let result = tournamentEngine.drawMatic({
    restrictEntryStatus: true,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  expect(matchUps.length).toEqual(drawSize / 2);
});
