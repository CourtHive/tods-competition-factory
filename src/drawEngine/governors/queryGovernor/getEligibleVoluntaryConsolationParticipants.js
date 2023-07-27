import { getPolicyDefinitions } from '../../../global/functions/deducers/getAppliedPolicies';
import { getStageEntries } from '../../getters/stageGetter';
import {
  allDrawMatchUps,
  allEventMatchUps,
} from '../../../tournamentEngine/getters/matchUpsGetter/matchUpsGetter';

import { POLICY_TYPE_VOLUNTARY_CONSOLATION } from '../../../constants/policyConstants';
import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { UNGROUPED, WITHDRAWN } from '../../../constants/entryStatusConstants';
import { DOUBLE_WALKOVER } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MAIN,
  PLAY_OFF,
  QUALIFYING,
  VOLUNTARY_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';

export function getEligibleVoluntaryConsolationParticipants({
  excludedMatchUpStatuses = [],
  includeEventParticipants, // boolean - consider event entries rather than draw entries (if event is present)
  includeQualifyingStage,
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

  const stages = [MAIN, PLAY_OFF];
  if (includeQualifyingStage) stages.push(QUALIFYING);

  const matchUps = includeEventParticipants
    ? allEventMatchUps({
        contextFilters: { stages },
        matchUpFilters: { matchUpTypes: [event.eventType] },
        tournamentRecord,
        inContext: true,
        event,
      })?.matchUps || []
    : allDrawMatchUps({
        contextFilters: { stages },
        matchUpFilters: { matchUpTypes: [event.eventType] },
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

  for (const matchUp of matchUps) {
    if (
      requirePlay &&
      ![1, 2].includes(matchUp.winningSide) &&
      !matchUp.matchUpStatus === DOUBLE_WALKOVER
    )
      continue;
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
      if (participantId) {
        matchUpParticipants[participantId] = side.participant;
        if (matchUp.matchUpStatus === DOUBLE_WALKOVER && !requirePlay) {
          losingParticipants[participantId] = side.participant;
          if (!participantMatchUps[participantId])
            participantMatchUps[participantId] = 0;
          if (!excludedMatchUpStatuses.includes(matchUp.matchUpStatus))
            participantMatchUps[participantId] += 1;
        }
      }
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
    !requirePlay &&
    !requireLoss &&
    allEntries;

  const enteredParticipantIds =
    considerEntered &&
    (includeEventParticipants && event ? event.entries : drawDefinition.entries)
      .filter((entry) => ![WITHDRAWN, UNGROUPED].includes(entry.entryStatus))
      .map(({ participantId }) => participantId);

  const losingParticipantIds = Object.keys(losingParticipants);
  const consideredParticipants = considerEntered
    ? tournamentRecord?.participants.filter(({ participantId }) =>
        enteredParticipantIds.includes(participantId)
      )
    : Object.values(requireLoss ? losingParticipants : matchUpParticipants);

  const satisfiesLoss = (participantId) =>
    !requireLoss || losingParticipantIds.includes(participantId);
  const satisfiesPlay = (participantId) =>
    !requirePlay || (participantMatchUps[participantId] || 0) >= 0;
  const satisfiesWinsLimit = (participantId) =>
    isNaN(winsLimit) || (participantWins[participantId] || 0) <= winsLimit;
  const satisfiesMatchUpsLimit = (participantId) =>
    !matchUpsLimit || participantMatchUps[participantId] <= matchUpsLimit;
  const notPreviouslySelected = (participantId) =>
    !voluntaryConsolationEntryIds.includes(participantId);

  const eligibleParticipants = consideredParticipants
    .filter(
      ({ participantId }) =>
        satisfiesLoss(participantId) &&
        satisfiesPlay(participantId) &&
        satisfiesWinsLimit(participantId) &&
        satisfiesMatchUpsLimit(participantId) &&
        notPreviouslySelected(participantId)
    )
    .map((participant) => {
      return {
        ...participant,
        individualParticipants: participant.individualParticipantIds?.map(
          (participantId) =>
            tournamentRecord.participants?.find(
              (individual) => individual.participantId === participantId
            )
        ),
      };
    });

  // PRESERVED for debugging
  /*
  const lossCheck = consideredParticipants.map(({ participantId }) =>
    satisfiesLoss(participantId)
  );
  const playCheck = consideredParticipants.map(({ participantId }) =>
    satisfiesPlay(participantId)
  );
  const winsCheck = consideredParticipants.map(({ participantId }) =>
    satisfiesWinsLimit(participantId)
  );
  const limitCheck = consideredParticipants.map(({ participantId }) =>
    satisfiesMatchUpsLimit(participantId)
  );
  const selectCheck = consideredParticipants.map(({ participantId }) =>
    notPreviouslySelected(participantId)
  );
  console.log(
    lossCheck.length,
    playCheck.length,
    winsCheck.length,
    limitCheck.length,
    selectCheck.length,
    { requireLoss, requirePlay },
    consideredParticipants.length,
    losingParticipantIds.length,
    eligibleParticipants.length
  );
  */

  return { eligibleParticipants, losingParticipantIds, ...SUCCESS };
}
