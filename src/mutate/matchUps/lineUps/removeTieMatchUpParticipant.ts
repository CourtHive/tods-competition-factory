import { getTieMatchUpContext } from '@Query/hierarchical/tieFormats/getTieMatchUpContext';
import { removeCollectionAssignments } from '@Mutate/events/removeCollectionAssignments';
import { getPairedParticipant } from '@Query/participant/getPairedParticipant';
import { deleteParticipants } from '@Mutate/participants/deleteParticipants';
import { modifyMatchUpNotice } from '@Mutate/notifications/drawNotifications';
import { modifyParticipant } from '@Mutate/participants/modifyParticipant';
import { updateTeamLineUp } from '@Mutate/drawDefinitions/updateTeamLineUp';
import { getAppliedPolicies } from '@Query/extensions/getAppliedPolicies';
import { checkScoreHasValue } from '@Query/matchUp/checkScoreHasValue';
import { getParticipants } from '@Query/participants/getParticipants';
import { addParticipant } from '@Mutate/participants/addParticipant';
import { decorateResult } from '@Functions/global/decorateResult';
import { ensureSideLineUps } from './ensureSideLineUps';

// constants and types
import POLICY_MATCHUP_ACTIONS_DEFAULT from '@Fixtures/policies/POLICY_MATCHUP_ACTIONS_DEFAULT';
import { POLICY_TYPE_MATCHUP_ACTIONS, POLICY_TYPE_SCORING } from '@Constants/policyConstants';
import { LineUp, PolicyDefinitions, ResultType } from '@Types/factoryTypes';
import { DrawDefinition, Event, Tournament } from '@Types/tournamentTypes';
import { INDIVIDUAL, PAIR } from '@Constants/participantConstants';
import { DOUBLES, SINGLES } from '@Constants/matchUpTypes';
import { COMPETITOR } from '@Constants/participantRoles';
import { SUCCESS } from '@Constants/resultConstants';
import {
  EXISTING_OUTCOME,
  INVALID_PARTICIPANT,
  INVALID_PARTICIPANT_IDS,
  MISSING_MATCHUP,
  MISSING_PARTICIPANT_ID,
  PARTICIPANT_NOT_FOUND,
} from '@Constants/errorConditionConstants';

type RemoveTieMatchUpParticipantIdArgs = {
  policyDefinitions?: PolicyDefinitions;
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  participantId: string;
  tieMatchUpId: string;
  event: Event;
};

export function removeTieMatchUpParticipantId(
  params: RemoveTieMatchUpParticipantIdArgs,
): ResultType & { modifiedLineUp?: LineUp } {
  const { tournamentRecord, drawDefinition, participantId, event } = params;
  const stack = 'removeTieMatchUpParticiapantId';

  if (!participantId) return decorateResult({ result: { error: MISSING_PARTICIPANT_ID }, stack });

  const matchUpContext = getTieMatchUpContext(params);
  if (matchUpContext.error) return matchUpContext;

  const { appliedPolicies } = getAppliedPolicies({
    tournamentRecord,
    drawDefinition,
    event,
  });

  const matchUpActionsPolicy =
    params.policyDefinitions?.[POLICY_TYPE_MATCHUP_ACTIONS] ??
    appliedPolicies?.[POLICY_TYPE_MATCHUP_ACTIONS] ??
    POLICY_MATCHUP_ACTIONS_DEFAULT[POLICY_TYPE_MATCHUP_ACTIONS];

  const substitutionProcessCodes = matchUpActionsPolicy?.processCodes?.substitution;

  const {
    inContextDualMatchUp,
    inContextTieMatchUp,
    relevantAssignments,
    collectionPosition,
    teamParticipants,
    collectionId,
    matchUpType,
    dualMatchUp,
    tieMatchUp,
    tieFormat,
  } = matchUpContext;

  if (!dualMatchUp) return decorateResult({ result: { error: MISSING_MATCHUP }, stack });

  const side: any = inContextTieMatchUp?.sides?.find(
    (side: any) =>
      side.participant?.participantId === participantId ||
      side.participant?.individualParticipantIds?.includes(participantId),
  );
  if (!side) return decorateResult({ result: { error: PARTICIPANT_NOT_FOUND }, stack });

  const scoringPolicy = params.policyDefinitions?.[POLICY_TYPE_SCORING] ?? appliedPolicies?.[POLICY_TYPE_SCORING];

  if (
    !side.substitutions?.length &&
    (checkScoreHasValue({ score: inContextTieMatchUp?.score }) || inContextTieMatchUp?.winningSide) &&
    scoringPolicy?.requireParticipantsForScoring !== false
  )
    return decorateResult({ result: { error: EXISTING_OUTCOME }, stack });

  const teamParticipantId = inContextDualMatchUp?.sides?.find(
    ({ sideNumber }) => sideNumber === side.sideNumber,
  )?.participantId;

  if (!teamParticipantId) return decorateResult({ result: { error: PARTICIPANT_NOT_FOUND }, stack });

  const participantToRemove = getParticipants({
    participantFilters: { participantIds: [participantId] },
    tournamentRecord,
  })?.participants?.[0];

  if (!participantToRemove) {
    return decorateResult({ result: { error: PARTICIPANT_NOT_FOUND }, stack });
  }

  if (matchUpType === SINGLES && participantToRemove.participantType === PAIR) {
    return decorateResult({ result: { error: INVALID_PARTICIPANT }, stack });
  }

  const participantIds =
    participantToRemove.participantType === INDIVIDUAL ? [participantId] : participantToRemove.individualParticipantIds;

  ensureSideLineUps({
    tournamentId: tournamentRecord.tournamentId,
    eventId: event.eventId,
    inContextDualMatchUp,
    drawDefinition,
    dualMatchUp,
  });

  let dualMatchUpSide = dualMatchUp.sides?.find(({ sideNumber }) => sideNumber === side.sideNumber);

  if (!dualMatchUpSide && (dualMatchUp.sides?.filter(({ lineUp }) => !lineUp).length || 0) < 2) {
    const drawPositionMap = teamParticipants?.map(({ participantId: teamParticipantId }) => ({
      drawPosition: relevantAssignments?.find((assignment) => assignment.participantId === teamParticipantId)
        ?.drawPosition,
      teamParticipantId,
    }));

    dualMatchUpSide = dualMatchUp.sides?.find(
      (side: any) =>
        drawPositionMap?.find(({ drawPosition }) => drawPosition === side.drawPosition)?.teamParticipantId ===
        teamParticipantId,
    );
  }

  if (!dualMatchUpSide) {
    return decorateResult({
      result: { error: PARTICIPANT_NOT_FOUND, context: { participantId } },
    });
  }

  const { modifiedLineUp, previousParticipantIds } = removeCollectionAssignments({
    collectionPosition,
    teamParticipantId,
    dualMatchUpSide,
    participantIds,
    drawDefinition,
    collectionId,
  });

  dualMatchUpSide.lineUp = modifiedLineUp;

  teamParticipantId &&
    tieFormat &&
    updateTeamLineUp({
      participantId: teamParticipantId,
      lineUp: modifiedLineUp,
      drawDefinition,
      tieFormat,
    });

  // if an INDIVIDUAL participant is being removed from a DOUBLES matchUp
  // ...then the PAIR participant may need to be modified
  if (matchUpType === DOUBLES && participantToRemove.participantType === INDIVIDUAL) {
    const tieMatchUpSide = inContextTieMatchUp?.sides?.find((side) => side.sideNumber === dualMatchUpSide?.sideNumber);

    const { participantId: pairParticipantId } = tieMatchUpSide ?? {};

    const pairParticipant =
      pairParticipantId &&
      getParticipants({
        participantFilters: { participantIds: [pairParticipantId] },
        tournamentRecord,
        withDraws: true,
      })?.participants?.[0];

    if (pairParticipant) {
      const individualParticipantIds: string[] =
        pairParticipant?.individualParticipantIds?.filter((currentId) => currentId !== participantId) ?? [];

      if (previousParticipantIds) individualParticipantIds.push(...previousParticipantIds);

      if (individualParticipantIds.length > 2) {
        return decorateResult({
          result: { error: INVALID_PARTICIPANT_IDS },
          stack,
        });
      }

      // don't modify pair participant that is part of other events/draws
      if (!pairParticipant.draws?.length) {
        if (individualParticipantIds.length) {
          pairParticipant.individualParticipantIds = individualParticipantIds;
          const result = modifyParticipant({
            participant: pairParticipant,
            pairOverride: true,
            tournamentRecord,
          });
          if (result.error) return decorateResult({ result, stack });
        } else {
          const result = deleteParticipants({
            participantIds: [pairParticipantId],
            tournamentRecord,
          });
          if (result.error) console.log('cleanup', { result });
        }
      } else if (individualParticipantIds.length === 1) {
        const { participant: existingParticipant } = getPairedParticipant({
          participantIds: individualParticipantIds,
          tournamentRecord,
        });
        if (!existingParticipant) {
          const newPairParticipant = {
            participantRole: COMPETITOR,
            individualParticipantIds,
            participantType: PAIR,
          };
          const result = addParticipant({
            participant: newPairParticipant,
            pairOverride: true,
            tournamentRecord,
          });
          if (result.error) return decorateResult({ result, stack });
        }
      }
    } else {
      return decorateResult({
        result: { error: PARTICIPANT_NOT_FOUND },
        stack,
      });
    }
  }

  // if there was only one subsitution on target side and there are no substiutions on other side
  if (side.substitutions?.length === 1) {
    const otherSide: any = inContextTieMatchUp?.sides?.find((s) => s.sideNumber !== side.sideNumber);
    if (!otherSide?.substitutions?.length && tieMatchUp?.processCodes?.length) {
      // remove processCode(s)
      for (const substitutionProcessCode of substitutionProcessCodes || []) {
        const codeIndex = tieMatchUp.processCodes.lastIndexOf(substitutionProcessCode);
        // remove only one instance of substitutionProcessCode
        tieMatchUp.processCodes.splice(codeIndex, 1);
      }

      modifyMatchUpNotice({
        tournamentId: tournamentRecord?.tournamentId,
        matchUp: tieMatchUp,
        context: stack,
        drawDefinition,
      });
    }
  }

  modifyMatchUpNotice({
    tournamentId: tournamentRecord?.tournamentId,
    matchUp: dualMatchUp,
    context: stack,
    drawDefinition,
  });

  return { ...SUCCESS, modifiedLineUp };
}
