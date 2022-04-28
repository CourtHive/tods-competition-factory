import { getPolicyDefinitions } from '../../../tournamentEngine/governors/queryGovernor/getPolicyDefinitions';
import { allDrawMatchUps } from '../../../tournamentEngine/getters/matchUpsGetter';
import { getStageEntries } from '../../getters/stageGetter';

import { POLICY_TYPE_VOLUNTARY_CONSOLATION } from '../../../constants/policyConstants';
import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MAIN,
  PLAY_OFF,
  VOLUNTARY_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';

export function getEligibleVoluntaryConsolationParticipants({
  excludedMatchUpStatuses = [],
  finishingRoundLimit,
  requireLoss = true,
  policyDefinitions,
  roundNumberLimit,
  tournamentRecord,
  drawDefinition,
  matchUpsLimit,
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

  const voluntaryConsolationEntries = getStageEntries({
    stage: VOLUNTARY_CONSOLATION,
    drawDefinition,
  });
  const voluntaryConsolationEntryIds = voluntaryConsolationEntries.map(
    ({ participantId }) => participantId
  );

  const participantMatchUps = {};
  const losingParticipants = {};
  const allParticipants = {};
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
  roundNumberLimit = roundNumberLimit || policy?.roundNumberLimit;

  winsLimit = winsLimit || policy?.winsLimit;
  if (isNaN(winsLimit)) winsLimit = 0;

  for (const matchUp of matchUps) {
    if (![1, 2].includes(matchUp.winningSide)) continue;
    if (
      !isNaN(finishingRoundLimit) &&
      matchUp.finishingRound >= finishingRoundLimit
    )
      continue;
    if (!isNaN(roundNumberLimit) && matchUp.finishingRound <= roundNumberLimit)
      continue;

    const losingSide = matchUp.sides?.find(
      ({ sideNumber }) => sideNumber !== matchUp.winningSide
    );
    if (losingSide?.participant) {
      const participantId = losingSide.participant.participantId;
      losingParticipants[participantId] = losingSide.participant;
      allParticipants[participantId] = losingSide.participant;

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
      allParticipants[participantId] = winningSide.participant;

      if (!participantWins[participantId]) participantWins[participantId] = 0;
      participantWins[participantId] += 1;

      if (!participantMatchUps[participantId])
        participantMatchUps[participantId] = 0;

      if (!excludedMatchUpStatuses.includes(matchUp.matchUpStatus))
        participantMatchUps[participantId] += 1;
    }
  }

  const consideredParticipants = Object.values(
    requireLoss ? losingParticipants : allParticipants
  );

  const eligibleParticipants = consideredParticipants.filter(
    ({ participantId }) =>
      ((participantWins[participantId] || 0) <= winsLimit ||
        (!requireLoss && !winsLimit)) &&
      (!matchUpsLimit || participantMatchUps[participantId] < matchUpsLimit) &&
      !voluntaryConsolationEntryIds.includes(participantId)
  );

  const losingParticipantIds = Object.keys(losingParticipants);

  return { eligibleParticipants, losingParticipantIds, ...SUCCESS };
}
