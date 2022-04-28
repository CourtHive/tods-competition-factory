import { getPolicyDefinitions } from '../../../tournamentEngine/governors/queryGovernor/getPolicyDefinitions';
import { allDrawMatchUps } from '../../../tournamentEngine/getters/matchUpsGetter';

import { POLICY_TYPE_VOLUNTARY_CONSOLATION } from '../../../constants/policyConstants';
import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { MAIN, PLAY_OFF } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getEligibleVoluntaryConsolationParticipants({
  excludedMatchUpStatuses = [],
  finishingRoundLimit,
  policyDefinitions,
  tournamentRecord,
  drawDefinition,
  matchUpsLimit,
  roundLimit,
  winsLimit,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const { matchUps } = allDrawMatchUps({
    contextFilters: { stages: [MAIN, PLAY_OFF] },
    tournamentRecord,
    inContext: true,
    drawDefinition,
  });

  const participantMatchUps = {};
  const losingParticipants = {};
  const participantWins = {};

  policyDefinitions =
    policyDefinitions ||
    getPolicyDefinitions({
      policyTypes: [POLICY_TYPE_VOLUNTARY_CONSOLATION],
      tournamentRecord,
      drawDefinition,
      event,
    });

  const policy = policyDefinitions[POLICY_TYPE_VOLUNTARY_CONSOLATION];
  excludedMatchUpStatuses =
    (excludedMatchUpStatuses.length && excludedMatchUpStatuses) ||
    policy?.excludedMatchUpStatuses ||
    [];

  finishingRoundLimit = finishingRoundLimit || policy?.finishingRoundLimit;
  matchUpsLimit = matchUpsLimit || policy?.matchUpsLimit;
  roundLimit = roundLimit || policy?.roundLimit;

  winsLimit = winsLimit || policy?.winsLimit;
  if (isNaN(winsLimit)) winsLimit = 0;

  for (const matchUp of matchUps) {
    if (![1, 2].includes(matchUp.winningSide)) continue;
    if (
      !isNaN(finishingRoundLimit) &&
      matchUp.finishingRound >= finishingRoundLimit
    )
      continue;
    if (!isNaN(roundLimit) && matchUp.finishingRound <= roundLimit) continue;

    const losingSide = matchUp.sides?.find(
      ({ sideNumber }) => sideNumber !== matchUp.winningSide
    );
    if (losingSide?.participant) {
      const participantId = losingSide.participant.participantId;
      losingParticipants[participantId] = losingSide.participant;

      if (!participantMatchUps[participantId])
        participantMatchUps[participantId] = 0;

      if (!excludedMatchUpStatuses.includes(matchUp.matchUpStatus))
        participantMatchUps[participantId] += 1;
    }

    const winningSide = matchUp.sides?.find(
      ({ sideNumber }) => sideNumber === matchUp.winningSide
    );
    if (winningSide?.participant) {
      const participantId = winningSide.participant.participantId;
      if (!participantWins[participantId]) participantWins[participantId] = 0;
      participantWins[participantId] += 1;

      if (!participantMatchUps[participantId])
        participantMatchUps[participantId] = 0;

      if (!excludedMatchUpStatuses.includes(matchUp.matchUpStatus))
        participantMatchUps[participantId] += 1;
    }
  }

  const eligibleParticipants = Object.values(losingParticipants).filter(
    ({ participantId }) =>
      (participantWins[participantId] || 0) <= (winsLimit || 0) &&
      (!matchUpsLimit || participantMatchUps[participantId] < matchUpsLimit)
  );

  const losingParticipantIds = Object.keys(losingParticipants);

  return { eligibleParticipants, losingParticipantIds, ...SUCCESS };
}
