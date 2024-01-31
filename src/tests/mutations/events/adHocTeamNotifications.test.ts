import { isMatchUpEventType } from '@Helpers/matchUpEventTypes/isMatchUpEventType';
import { setSubscriptions } from '@Global/state/globalState';
import { getMatchUpId } from '@Functions/global/extractors';
import { tournamentEngine } from '@Engines/syncEngine';
import { mocksEngine } from '@Assemblies/engines/mock';
import { expect, it } from 'vitest';

// constants
import { ADD_MATCHUPS, DELETED_MATCHUP_IDS } from '@Constants/topicConstants';
import { COLLEGE_DEFAULT, DOMINANT_DUO } from '@Constants/tieFormatConstants';
import { DEFAULTED } from '@Constants/matchUpStatusConstants';
import { AD_HOC } from '@Constants/drawDefinitionConstants';
import { TEAM } from '@Constants/eventConstants';

// testing for generation of addMatchUps notifications for tieMatchUps in AD_HOC TEAM events
// each scenario generates a different number of matchUps due to different tieFormats having different collectionDefinitions
const scenarios = [
  { drawProfile: { tieFormatName: COLLEGE_DEFAULT, drawSize: 4 }, expectation: { added: 20 } },
  { drawProfile: { tieFormatName: DOMINANT_DUO, drawSize: 4 }, expectation: { added: 8 } },
];

it.each(scenarios)('generates addMatchUps notifications for tieMatchUps in AD_HOC TEAM events', (scenario) => {
  const addedMatchUpIds: string[] = [];
  const deletedMatchUpIds: string[] = [];
  const subscriptions = {
    [ADD_MATCHUPS]: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach((item) => {
          const matchUpIds = item.matchUps.map(getMatchUpId);
          addedMatchUpIds.push(...matchUpIds);
        });
      }
    },
    [DELETED_MATCHUP_IDS]: (notices) => {
      notices.forEach(({ matchUpIds }) => deletedMatchUpIds.push(...matchUpIds));
    },
  };

  setSubscriptions({ subscriptions });

  const drawId = 'drawId';
  const result = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { ...scenario.drawProfile, drawType: AD_HOC, automated: true, eventType: TEAM, roundsCount: 1, drawId },
    ],
    setState: true,
  });
  expect(result.success).toEqual(true);
  expect(addedMatchUpIds.length).toEqual(scenario.expectation.added);

  const matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  expect(matchUps.length).toEqual(scenario.expectation.added);

  const teamMatchUps = matchUps.filter(isMatchUpEventType(TEAM));
  const targetTeamMatchUp = teamMatchUps[0];
  const targetTieMatchUp = targetTeamMatchUp.tieMatchUps[0];
  const targetSide = targetTeamMatchUp.sides[0];
  const targetIndividualParticipant = targetSide.participant.individualParticipants[0];
  const assignmentResult = tournamentEngine.assignTieMatchUpParticipantId({
    participantId: targetIndividualParticipant.participantId,
    tieMatchUpId: targetTieMatchUp.matchUpId,
    drawId,
  });
  expect(assignmentResult.success).toEqual(true);

  const statusResult = tournamentEngine.setMatchUpStatus({
    outcome: { matchUpStatus: DEFAULTED, winningSide: 1 },
    matchUpId: targetTeamMatchUp.matchUpId,
    drawId,
  });
  expect(statusResult.success).toEqual(true);

  const teamMatchUpIds = tournamentEngine
    .allTournamentMatchUps({ matchUpFilters: { matchUpTypes: [TEAM] } })
    .matchUps.map(getMatchUpId);

  const deletionResult = tournamentEngine.deleteAdHocMatchUps({ matchUpIds: teamMatchUpIds, drawId });
  expect(deletionResult.success).toEqual(true);
  expect(deletedMatchUpIds.length).toEqual(scenario.expectation.added);
});
