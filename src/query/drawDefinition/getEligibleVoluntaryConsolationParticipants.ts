import { getPolicyDefinitions } from '../extensions/getAppliedPolicies';
import { allEventMatchUps } from '../matchUps/getAllEventMatchUps';
import { allDrawMatchUps } from '../matchUps/getAllDrawMatchUps';
import { getStageEntries } from './stageGetter';

// constants and types
import { MAIN, PLAY_OFF, QUALIFYING, VOLUNTARY_CONSOLATION } from '@Constants/drawDefinitionConstants';
import { ErrorType, MISSING_DRAW_DEFINITION } from '@Constants/errorConditionConstants';
import { POLICY_TYPE_VOLUNTARY_CONSOLATION } from '@Constants/policyConstants';
import { UNGROUPED, WITHDRAWN } from '@Constants/entryStatusConstants';
import { DOUBLE_WALKOVER } from '@Constants/matchUpStatusConstants';
import { PolicyDefinitions } from '@Types/factoryTypes';
import { SUCCESS } from '@Constants/resultConstants';
import { HydratedSide } from '@Types/hydrated';
import {
  DrawDefinition,
  Event,
  MatchUpStatusUnion,
  Participant,
  StageTypeUnion,
  Tournament,
} from '@Types/tournamentTypes';

type GetEligibleVoluntaryConsolationParticipantsArgs = {
  excludedMatchUpStatuses?: MatchUpStatusUnion[];
  policyDefinitions?: PolicyDefinitions;
  includeEventParticipants?: boolean;
  includeQualifyingStage?: boolean;
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  finishingRoundLimit?: number;
  roundNumberLimit?: number;
  matchUpsLimit?: number;
  requirePlay?: boolean;
  requireLoss?: boolean;
  allEntries?: boolean;
  winsLimit?: number;
  event?: Event;
};

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
  requirePlay,
  requireLoss,
  allEntries, // boolean - consider all entries, regardless of whether placed in draw
  winsLimit,
  event,
}: GetEligibleVoluntaryConsolationParticipantsArgs): {
  eligibleParticipants?: Participant[];
  losingParticipantIds?: string[];
  error?: ErrorType;
} {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const stages: StageTypeUnion[] = [MAIN, PLAY_OFF];
  if (includeQualifyingStage) stages.push(QUALIFYING);

  const eventMatchUpFilters = event?.eventType ? { matchUpTypes: [event.eventType] } : undefined;
  const drawMatchUpFilters = drawDefinition?.matchUpType ? { matchUpTypes: [drawDefinition.matchUpType] } : undefined;

  const matchUps =
    includeEventParticipants && event
      ? allEventMatchUps({
          contextFilters: { stages },
          matchUpFilters: eventMatchUpFilters,
          tournamentRecord,
          inContext: true,
          event,
        })?.matchUps ?? []
      : allDrawMatchUps({
          contextFilters: { stages },
          matchUpFilters: drawMatchUpFilters,
          tournamentRecord,
          inContext: true,
          drawDefinition,
        })?.matchUps ?? [];

  const voluntaryConsolationEntries = getStageEntries({
    stage: VOLUNTARY_CONSOLATION,
    drawDefinition,
  });
  const voluntaryConsolationEntryIds = voluntaryConsolationEntries.map(({ participantId }) => participantId);

  const participantMatchUps = {};
  const losingParticipants = {};
  const matchUpParticipants = {};
  const participantWins = {};

  if (!policyDefinitions) {
    policyDefinitions = getPolicyDefinitions({
      policyTypes: [POLICY_TYPE_VOLUNTARY_CONSOLATION],
      tournamentRecord,
      drawDefinition,
      event,
    }).policyDefinitions;
  }

  // support POLICY_TYPE_VOLUNTARY_CONSOLATION
  const policy = policyDefinitions?.[POLICY_TYPE_VOLUNTARY_CONSOLATION];
  excludedMatchUpStatuses =
    (excludedMatchUpStatuses.length && excludedMatchUpStatuses) || policy?.excludedMatchUpStatuses || [];

  includeEventParticipants = includeEventParticipants ?? policy?.includeEventParticipants;
  allEntries = allEntries ?? policy?.allEntries;
  finishingRoundLimit = finishingRoundLimit ?? policy?.finishingRoundLimit;
  roundNumberLimit = roundNumberLimit ?? policy?.roundNumberLimit;
  matchUpsLimit = matchUpsLimit ?? policy?.matchUpsLimit;

  if (requirePlay === undefined) {
    requirePlay = policy?.requirePlay !== undefined ? policy.requirePlay : true;
  }

  if (requireLoss === undefined) {
    requireLoss = policy?.requireLoss !== undefined ? policy.requireLoss : true;
  }
  // end policy support

  winsLimit = winsLimit ?? policy?.winsLimit;

  for (const matchUp of matchUps) {
    if (
      requirePlay &&
      matchUp.winningSide &&
      ![1, 2].includes(matchUp.winningSide) &&
      matchUp.matchUpStatus !== DOUBLE_WALKOVER
    )
      continue;
    if (matchUp.finishingRound && finishingRoundLimit && matchUp.finishingRound >= finishingRoundLimit) continue;
    if (matchUp.finishingRound && roundNumberLimit && matchUp.finishingRound <= roundNumberLimit) continue;

    const losingSide = matchUp.sides?.find(
      ({ sideNumber }) => matchUp.winningSide && sideNumber === 3 - matchUp.winningSide,
    ) as HydratedSide;
    const winningSide = matchUp.sides?.find(
      ({ sideNumber }) => matchUp.winningSide && sideNumber === matchUp.winningSide,
    ) as HydratedSide;

    matchUp.sides?.forEach((side: HydratedSide) => {
      const participantId = side?.participant?.participantId;
      if (participantId) {
        matchUpParticipants[participantId] = side.participant;
        if (matchUp.matchUpStatus === DOUBLE_WALKOVER && !requirePlay) {
          losingParticipants[participantId] = side.participant;
          if (!participantMatchUps[participantId]) participantMatchUps[participantId] = 0;
          if (!matchUp.matchUpStatus || !excludedMatchUpStatuses.includes(matchUp.matchUpStatus))
            participantMatchUps[participantId] += 1;
        }
      }
    });

    if (losingSide?.participant) {
      const participantId = losingSide.participant.participantId;
      losingParticipants[participantId] = losingSide.participant;

      if (!participantMatchUps[participantId]) participantMatchUps[participantId] = 0;

      if (matchUp.matchUpStatus && !excludedMatchUpStatuses.includes(matchUp.matchUpStatus))
        participantMatchUps[participantId] += 1;
    }

    if (winningSide?.participant) {
      const participantId = winningSide.participant.participantId;

      if (!participantWins[participantId]) participantWins[participantId] = 0;
      participantWins[participantId] += 1;

      if (!participantMatchUps[participantId]) participantMatchUps[participantId] = 0;

      if (matchUp.matchUpStatus && !excludedMatchUpStatuses.includes(matchUp.matchUpStatus))
        participantMatchUps[participantId] += 1;
    }
  }

  const considerEntered = tournamentRecord?.participants && !requirePlay && !requireLoss && allEntries;

  const enteredParticipantIds = considerEntered
    ? ((includeEventParticipants && event ? event.entries : drawDefinition.entries) ?? [])
        .filter((entry: any) => ![WITHDRAWN, UNGROUPED].includes(entry.entryStatus))
        .map(({ participantId }) => participantId)
    : [];

  const losingParticipantIds = Object.keys(losingParticipants);
  const consideredParticipants = considerEntered
    ? (tournamentRecord?.participants ?? []).filter(({ participantId }) =>
        enteredParticipantIds.includes(participantId),
      )
    : (requireLoss && Object.values(losingParticipants)) || Object.values(matchUpParticipants);

  const satisfiesLoss = (participantId) => !requireLoss || losingParticipantIds.includes(participantId);
  const satisfiesPlay = (participantId) => !requirePlay || (participantMatchUps[participantId] || 0) >= 0;
  const satisfiesWinsLimit = (participantId) => !winsLimit || (participantWins[participantId] || 0) <= winsLimit;
  const satisfiesMatchUpsLimit = (participantId) =>
    !matchUpsLimit || participantMatchUps[participantId] <= matchUpsLimit;
  const notPreviouslySelected = (participantId) => !voluntaryConsolationEntryIds.includes(participantId);

  const eligibleParticipants = consideredParticipants
    .filter(
      (participant: any) =>
        satisfiesLoss(participant.participantId) &&
        satisfiesPlay(participant.participantId) &&
        satisfiesWinsLimit(participant.participantId) &&
        satisfiesMatchUpsLimit(participant.participantId) &&
        notPreviouslySelected(participant.participantId),
    )
    .map((participant: any) => {
      return {
        ...participant,
        individualParticipants: participant.individualParticipantIds?.map((participantId) =>
          tournamentRecord?.participants?.find((individual) => individual.participantId === participantId),
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
