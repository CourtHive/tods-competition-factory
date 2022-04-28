import { getPolicyDefinitions } from '../../../tournamentEngine/governors/queryGovernor/getPolicyDefinitions';
import { getStageEntries } from '../../getters/stageGetter';
import {
  allDrawMatchUps,
  allEventMatchUps,
} from '../../../tournamentEngine/getters/matchUpsGetter';

import { POLICY_TYPE_VOLUNTARY_CONSOLATION } from '../../../constants/policyConstants';
import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { WITHDRAWN } from '../../../constants/entryStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MAIN,
  PLAY_OFF,
  VOLUNTARY_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';

export function getEligibleVoluntaryConsolationParticipants({
  excludedMatchUpStatuses = [],
  includeEventParticipants, // boolean - consider event entries rather than draw entries (if event is present)
  finishingRoundLimit,
  policyDefinitions,
  roundNumberLimit,
  tournamentRecord,
  drawDefinition,
  matchUpsLimit,
  allEntries, // boolean - consider all entries, regardless of whether placed in draw
  requirePlay,
  requireLoss,
  winsLimit,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const matchUps = includeEventParticipants
    ? allEventMatchUps({
        contextFilters: { stages: [MAIN, PLAY_OFF] },
        tournamentRecord,
        inContext: true,
        event,
      })?.matchUps || []
    : allDrawMatchUps({
        contextFilters: { stages: [MAIN, PLAY_OFF] },
        tournamentRecord,
        inContext: true,
        drawDefinition,
      })?.matchUps || [];

  const voluntaryConsolationEntries = getStageEntries({
    stage: VOLUNTARY_CONSOLATION,
    drawDefinition,
  });
  const voluntaryConsolationEntryIds = voluntaryConsolationEntries.map(
    ({ participantId }) => participantId
  );

  const participantMatchUps = {};
  const losingParticipants = {};
  const matchUpParticipants = {};
  const participantWins = {};

  policyDefinitions =
    policyDefinitions ||
    getPolicyDefinitions({
      policyTypes: [POLICY_TYPE_VOLUNTARY_CONSOLATION],
      tournamentRecord,
      drawDefinition,
      event,
    });

  // support POLICY_TYPE_VOLUNTARY_CONSOLATION
  const policy = policyDefinitions[POLICY_TYPE_VOLUNTARY_CONSOLATION];
  excludedMatchUpStatuses =
    (excludedMatchUpStatuses.length && excludedMatchUpStatuses) ||
    policy?.excludedMatchUpStatuses ||
    [];

  includeEventParticipants =
    includeEventParticipants !== undefined
      ? includeEventParticipants
      : policy?.includeEventParticipants;
  allEntries = allEntries !== undefined ? allEntries : policy?.allEntries;
  finishingRoundLimit = finishingRoundLimit || policy?.finishingRoundLimit;
  roundNumberLimit = roundNumberLimit || policy?.roundNumberLimit;
  matchUpsLimit = matchUpsLimit || policy?.matchUpsLimit;

  requirePlay =
    requirePlay === false
      ? false
      : policy?.requirePlay !== undefined
      ? policy.requirePlay
      : true;

  requireLoss =
    requireLoss === false
      ? false
      : policy?.requireLoss !== undefined
      ? policy.requireLoss
      : true;
  // end policy support

  winsLimit = winsLimit || policy?.winsLimit;
  if (isNaN(winsLimit)) winsLimit = 0;

  for (const matchUp of matchUps) {
    if (requirePlay && ![1, 2].includes(matchUp.winningSide)) continue;
    if (
      !isNaN(finishingRoundLimit) &&
      matchUp.finishingRound >= finishingRoundLimit
    )
      continue;
    if (!isNaN(roundNumberLimit) && matchUp.finishingRound <= roundNumberLimit)
      continue;

    const losingSide = matchUp.sides?.find(
      ({ sideNumber }) => sideNumber === 3 - matchUp.winningSide
    );
    const winningSide = matchUp.sides?.find(
      ({ sideNumber }) => sideNumber === matchUp.winningSide
    );

    matchUp.sides.forEach((side) => {
      const participantId = side?.participant?.participantId;
      if (participantId) matchUpParticipants[participantId] = side.participant;
    });

    if (losingSide?.participant) {
      const participantId = losingSide.participant.participantId;
      losingParticipants[participantId] = losingSide.participant;

      if (!participantMatchUps[participantId])
        participantMatchUps[participantId] = 0;

      if (!excludedMatchUpStatuses.includes(matchUp.matchUpStatus))
        participantMatchUps[participantId] += 1;
    }

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

  const considerEntered =
    tournamentRecord?.participants &&
    (!requirePlay || !requireLoss) &&
    allEntries;

  const enteredParticipantIds =
    considerEntered &&
    (includeEventParticipants && event ? event.entries : drawDefinition.entries)
      .filter((entry) => entry.entryStatus !== WITHDRAWN)
      .map(({ participantId }) => participantId);

  const consideredParticipants = considerEntered
    ? tournamentRecord?.participants.filter(({ participantId }) =>
        enteredParticipantIds.includes(participantId)
      )
    : Object.values(
        requirePlay && requireLoss ? losingParticipants : matchUpParticipants
      );

  const eligibleParticipants = consideredParticipants.filter(
    ({ participantId }) =>
      ((participantWins[participantId] || 0) <= winsLimit ||
        ((!requireLoss || !requirePlay) && !winsLimit)) &&
      (!matchUpsLimit || participantMatchUps[participantId] <= matchUpsLimit) &&
      !voluntaryConsolationEntryIds.includes(participantId)
  );

  const losingParticipantIds = Object.keys(losingParticipants);

  return { eligibleParticipants, losingParticipantIds, ...SUCCESS };
}
