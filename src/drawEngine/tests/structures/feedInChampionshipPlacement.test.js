import drawEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../tournamentEngine';

import { FEED_IN_CHAMPIONSHIP } from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { MALE } from '../../../constants/genderConstants';
import { BYE } from '../../../constants/matchUpStatusConstants';

it('returns properly ordered drawPositions for consolation structure feed rounds', () => {
  const participantsProfile = {
    participantsCount: 8,
    sex: MALE,
  };
  const drawProfiles = [
    {
      drawSize: 32,
      eventType: SINGLES,
      participantsCount: 17,
      drawType: FEED_IN_CHAMPIONSHIP,
      feedPolicy: { roundGroupedOrder: [] },
    },
  ];
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
    goesTo: true,
  });

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const consolationStructure = drawDefinition.structures[1];

  const { structureId } = consolationStructure;
  const { matchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    matchUpFilters: { structureIds: [structureId] },
  });
  const { roundProfile } = drawEngine.getRoundMatchUps({ matchUps });
  expect(roundProfile[1].drawPositions).toEqual([
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
  ]);
  expect(roundProfile[2].drawPositions).toEqual([
    8,
    17,
    9,
    19,
    10,
    21,
    11,
    23,
    12,
    24,
    13,
    26,
    14,
    28,
    15,
    30,
  ]);
  // order of subsequent rounds has randomized undefined due to bye placements
});

// The scenario here is that a second round matchUp completes before a first round matchUp
// When the first round matchUps complete they should not find that drawPositions have already been filled by second round losers
it('can properly place participants in backdraw when rounds advance unevenly', () => {
  const participantsProfile = {
    participantsCount: 5,
    sex: MALE,
  };
  const drawProfiles = [
    {
      drawSize: 8,
      eventType: SINGLES,
      participantsCount: 5,
      drawType: FEED_IN_CHAMPIONSHIP,
      feedPolicy: { roundGroupedOrder: [] },
    },
  ];
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });

  tournamentEngine.setState(tournamentRecord);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  let [mainStructure, consolationStructure] = drawDefinition.structures;

  const { upcomingMatchUps } = drawEngine.getStructureMatchUps({
    drawDefinition,
    structureId: mainStructure.structureId,
  });

  const firstRoundMatchUps = upcomingMatchUps.filter(
    (matchUp) => matchUp.roundNumber === 1
  );
  const secondRoundMatchUps = upcomingMatchUps.filter(
    (matchUp) => matchUp.roundNumber === 2
  );
  expect(secondRoundMatchUps.length).toEqual(1);
  const targetSecondRoundMatchUp = secondRoundMatchUps[0];
  const { matchUpId } = targetSecondRoundMatchUp;

  let result = tournamentEngine.setMatchUpStatus({
    matchUpId,
    outcome: { winningSide: 1 },
    drawId,
  });
  expect(result.success).toEqual(true);
  const losingDrawPosition = targetSecondRoundMatchUp.drawPositions[1];

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  [mainStructure, consolationStructure] = drawDefinition.structures;
  const mainDrawLosingParticipantAssignment = mainStructure.positionAssignments.find(
    (assignment) => assignment.drawPosition === losingDrawPosition
  );

  const { matchUps } = drawEngine.allStructureMatchUps({
    drawDefinition,
    structureId: consolationStructure.structureId,
  });

  const { roundMatchUps } = drawEngine.getRoundMatchUps({ matchUps });
  const consolationTargetMatchUp = roundMatchUps[2].find(
    (matchUp) => matchUp.matchUpStatus !== BYE
  );
  const fedDrawPosition = Math.min(...consolationTargetMatchUp.drawPositions);
  const targetConsolationAssignment = consolationStructure.positionAssignments.find(
    (assignment) => assignment.drawPosition === fedDrawPosition
  );
  expect(mainDrawLosingParticipantAssignment.participantId).toEqual(
    targetConsolationAssignment.participantId
  );

  const consolationFirstRoundDrawPositions = roundMatchUps[1]
    .map((matchUp) => matchUp.drawPositions)
    .flat();

  let consolationFirstRoundAssignments = consolationStructure.positionAssignments
    .filter((assignment) =>
      consolationFirstRoundDrawPositions.includes(assignment.drawPosition)
    )
    .map((assignment) => assignment.participantId)
    .filter((f) => f);

  // expect that no first round positions have been assigned
  expect(consolationFirstRoundAssignments.length).toEqual(0);

  // expect that completing first round main structure matchUps will be successful
  firstRoundMatchUps.forEach((matchUp) => {
    const { matchUpId } = matchUp;
    result = tournamentEngine.setMatchUpStatus({
      matchUpId,
      outcome: { winningSide: 1 },
      drawId,
    });
    expect(result.success).toEqual(true);
  });

  // now check that consolation first round position assignments have been made
  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  [mainStructure, consolationStructure] = drawDefinition.structures;

  consolationFirstRoundAssignments = consolationStructure.positionAssignments
    .filter((assignment) =>
      consolationFirstRoundDrawPositions.includes(assignment.drawPosition)
    )
    .map((assignment) => assignment.participantId)
    .filter((f) => f);

  expect(consolationFirstRoundAssignments.length).toEqual(1);
});
