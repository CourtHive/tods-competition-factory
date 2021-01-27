import tournamentEngine from '../../../../tournamentEngine';
import mocksEngine from '../../../../mocksEngine';
import { unique } from '../../../../utilities';
import drawEngine from '../../..';

import {
  BYE,
  TO_BE_PLAYED,
} from '../../../../constants/matchUpStatusConstants';
import {
  ALTERNATE,
  DIRECT_ACCEPTANCE,
} from '../../../../constants/entryStatusConstants';

it('can generate drawSize: 8 with 6 participants', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 6,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const directAcceptanceEntries = drawDefinition.entries.filter(
    (e) => e.entryStatus === DIRECT_ACCEPTANCE
  );
  expect(directAcceptanceEntries.length).toEqual(6);

  const {
    upcomingMatchUps,
    pendingMatchUps,
    byeMatchUps,
  } = tournamentEngine.tournamentMatchUps();
  expect(upcomingMatchUps.length).toEqual(2);
  expect(pendingMatchUps.length).toEqual(3);
  expect(byeMatchUps.length).toEqual(2);

  const { structureId, drawPositions } = upcomingMatchUps[0];
  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition: drawPositions[0],
  });
  expect(result.isActiveDrawPosition).toEqual(false);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);

  let alternateOption = result.validActions.find(
    ({ type }) => type === ALTERNATE
  );
  const {
    method,
    payload,
    availableAlternatesParticipantIds,
  } = alternateOption;
  const alternateParticipantId = availableAlternatesParticipantIds[0];
  Object.assign(payload, { alternateParticipantId });
  result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);
});

it('can generate drawSize: 8 with only 4 participants', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 4,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const { roundMatchUps } = drawEngine.getRoundMatchUps({ matchUps });
  const firstRoundMatchUpStatuses = unique(
    roundMatchUps[1].map((m) => m.matchUpStatus)
  );
  expect(firstRoundMatchUpStatuses).toEqual([BYE]);
  /*
  const secondRoundMatchUpStatuses = unique(
    roundMatchUps[2].map((m) => m.matchUpStatus)
  );
  expect(secondRoundMatchUpStatuses).toEqual([BYE]);
  */
  const thirdRoundMatchUpStatuses = unique(
    roundMatchUps[3].map((m) => m.matchUpStatus)
  );
  expect(thirdRoundMatchUpStatuses).toEqual([TO_BE_PLAYED]);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const directAcceptanceEntries = drawDefinition.entries.filter(
    (e) => e.entryStatus === DIRECT_ACCEPTANCE
  );
  expect(directAcceptanceEntries.length).toEqual(4);
});

it('can drawSize: 8 with only 2 participants', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 2,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const { roundMatchUps } = drawEngine.getRoundMatchUps({ matchUps });
  const firstRoundMatchUpStatuses = unique(
    roundMatchUps[1].map((m) => m.matchUpStatus)
  );
  expect(firstRoundMatchUpStatuses).toEqual([BYE]);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  console.log(drawDefinition.structures[0].matchUps.length);
  const directAcceptanceEntries = drawDefinition.entries.filter(
    (e) => e.entryStatus === DIRECT_ACCEPTANCE
  );
  expect(directAcceptanceEntries.length).toEqual(2);

  const secondRoundMatchUpStatuses = unique(
    roundMatchUps[2].map((m) => m.matchUpStatus)
  );
  expect(secondRoundMatchUpStatuses).toEqual([TO_BE_PLAYED]);
  const tournamentMatchUps = tournamentEngine.tournamentMatchUps();
  console.log(tournamentMatchUps.byeMatchUps.map((m) => m.drawPositions));
  console.log(tournamentMatchUps.pendingMatchUps.map((m) => m.drawPositions));
  console.log(tournamentMatchUps.upcomingMatchUps.map((m) => m.drawPositions));
  const result = tournamentEngine.drawMatchUps({ drawId });
  console.log(result);
  // expect(upcomingMatchUps.length).toEqual(1);
});
