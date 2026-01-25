import { addMatchUpsNotice, modifyDrawNotice, modifyMatchUpNotice } from '@Mutate/notifications/drawNotifications';
import { generateCollectionMatchUps } from '@Assemblies/generators/drawDefinitions/tieMatchUps';
import { validateCollectionDefinition } from '@Validators/validateCollectionDefinition';
import { getAllStructureMatchUps } from '@Query/matchUps/getAllStructureMatchUps';
import { copyTieFormat } from '@Query/hierarchical/tieFormats/copyTieFormat';
import { calculateWinCriteria } from '@Query/matchUp/calculateWinCriteria';
import { getTieFormat } from '@Query/hierarchical/tieFormats/getTieFormat';
import { getAppliedPolicies } from '@Query/extensions/getAppliedPolicies';
import { tieFormatTelemetry } from '@Mutate/tieFormat/tieFormatTelemetry';
import { decorateResult } from '@Functions/global/decorateResult';
import { validateTieFormat } from '@Validators/validateTieFormat';
import { definedAttributes } from '@Tools/definedAttributes';
import { validUpdate } from '@Validators/validUpdate';
import { UUID } from '@Tools/UUID';

// constants and types
import { CANNOT_MODIFY_TIEFORMAT, DUPLICATE_VALUE, MISSING_DRAW_DEFINITION } from '@Constants/errorConditionConstants';
import { POLICY_TYPE_MATCHUP_ACTIONS } from '@Constants/policyConstants';
import { PolicyDefinitions, ResultType } from '@Types/factoryTypes';
import { SUCCESS } from '@Constants/resultConstants';
import { TEAM } from '@Constants/matchUpTypes';
import {
  Category,
  CollectionDefinition,
  DrawDefinition,
  Event,
  GenderUnion,
  MatchUp,
  TieFormat,
  Tournament,
} from '@Types/tournamentTypes';

/*
 * collectionDefinition will be added to an event tieFormat (if present)
 * if a matchUpId is provided, will be added to matchUp.tieFormat
 * if a structureId is provided, will be added to structure.tieFormat
 */

type AddCollectionDefinitionArgs = {
  collectionDefinition: CollectionDefinition;
  policyDefinitions?: PolicyDefinitions;
  updateInProgressMatchUps?: boolean;
  referenceGender?: GenderUnion;
  drawDefinition: DrawDefinition;
  referenceCategory?: Category;
  tournamentRecord: Tournament;
  enforceCategory?: boolean;
  enforceGender?: boolean;
  tieFormatName?: string;
  structureId?: string;
  matchUpId?: string;
  matchUp?: MatchUp;
  eventId?: string;
  uuids?: string[];
  event?: Event;
};

export function addCollectionDefinition({
  updateInProgressMatchUps = true,
  collectionDefinition,
  referenceCategory,
  tournamentRecord,
  policyDefinitions,
  enforceCategory,
  referenceGender,
  drawDefinition,
  tieFormatName,
  enforceGender,
  structureId,
  matchUpId,
  matchUp,
  eventId,
  uuids,
  event,
}: AddCollectionDefinitionArgs): ResultType & {
  tieFormat?: TieFormat;
  targetMatchUps?: any;
  addedMatchUps?: any;
} {
  const stack = 'addCollectionDefinition';
  const appliedPolicies =
    getAppliedPolicies({
      tournamentRecord,
      drawDefinition,
      event,
    }).appliedPolicies ?? {};

  const matchUpActionsPolicy =
    policyDefinitions?.[POLICY_TYPE_MATCHUP_ACTIONS] ?? appliedPolicies?.[POLICY_TYPE_MATCHUP_ACTIONS];

  enforceCategory = enforceCategory ?? matchUpActionsPolicy?.participants?.enforceCategory;

  const genderEnforced = (enforceGender ?? matchUpActionsPolicy?.participants?.enforceGender) !== false;

  const checkCategory = !!((referenceCategory ?? event?.category) && enforceCategory !== false);
  const checkGender = !!((referenceGender ?? event?.gender) && genderEnforced);

  const validationResult = validateCollectionDefinition({
    referenceCategory: referenceCategory ?? event?.category,
    collectionDefinition,
    referenceGender,
    checkCategory,
    checkGender,
    event,
  });
  if (validationResult.error) {
    return decorateResult({ result: validationResult, stack });
  }

  let result = !matchUp?.tieFormat
    ? getTieFormat({
        drawDefinition,
        structureId,
        matchUpId,
        eventId,
        event,
      })
    : undefined;

  if (result?.error) return decorateResult({ result: { error: result.error }, stack });

  const structure = result?.structure;
  matchUp = matchUp ?? result?.matchUp;
  const existingTieFormat = matchUp?.tieFormat ?? result?.tieFormat;
  const tieFormat = copyTieFormat(existingTieFormat);

  result = validateTieFormat({ tieFormat });
  if (result?.error) {
    return decorateResult({ result: { error: result.error }, stack });
  }

  if (!collectionDefinition.collectionId) {
    collectionDefinition.collectionId = UUID();
  } else {
    const collectionIds = tieFormat.collectionDefinitions.map(({ collectionId }) => collectionId);
    if (collectionIds.includes(collectionDefinition.collectionId))
      return decorateResult({
        context: { collectionId: collectionDefinition.collectionId },
        result: { error: DUPLICATE_VALUE },
      });
  }

  tieFormat.collectionDefinitions.push(collectionDefinition);
  tieFormat.collectionDefinitions
    .sort((a, b) => (a.collectionOrder || 0) - (b.collectionOrder || 0))
    .forEach((collectionDefinition, i) => (collectionDefinition.collectionOrder = i + 1));

  // calculate new winCriteria for tieFormat
  // if existing winCriteria is aggregateValue, retain
  const { aggregateValue, valueGoal } = calculateWinCriteria(tieFormat);
  tieFormat.winCriteria = definedAttributes({ aggregateValue, valueGoal });

  // if valueGoal has changed, force renaming of the tieFormat
  const originalValueGoal = existingTieFormat?.winCriteria.valueGoal;
  const wasAggregateValue = existingTieFormat?.winCriteria.aggregateValue;
  if ((originalValueGoal && originalValueGoal !== valueGoal) || (aggregateValue && !wasAggregateValue)) {
    if (tieFormatName) {
      tieFormat.tieFormatName = tieFormatName;
    } else {
      delete tieFormat.tieFormatName;
    }
  }

  const modifiedStructureIds: string[] = [];
  const addedMatchUps: any[] = [];
  let targetMatchUps: any[] = [];

  const prunedTieFormat = definedAttributes(tieFormat);
  result = validateTieFormat({ tieFormat: prunedTieFormat });
  if (result?.error) {
    return decorateResult({ result: { error: result.error }, stack });
  }

  if (eventId && event) {
    event.tieFormat = prunedTieFormat;

    // all team matchUps in the event which do not have tieFormats and where draws/strucures do not have tieFormats should have matchUps added
    for (const drawDefinition of event.drawDefinitions ?? []) {
      if (drawDefinition.tieFormat) continue;
      for (const structure of drawDefinition.structures ?? []) {
        if (structure.tieFormat) continue;
        const result = updateStructureMatchUps({
          updateInProgressMatchUps,
          collectionDefinition,
          structure,
          uuids,
        });
        addedMatchUps.push(...result.newMatchUps);
        targetMatchUps.push(...result.targetMatchUps);
        modifiedStructureIds.push(structure.structureId);
      }
    }

    queueNoficiations({
      modifiedMatchUps: targetMatchUps,
      eventId: event?.eventId,
      modifiedStructureIds,
      tournamentRecord,
      drawDefinition,
      addedMatchUps,
      stack,
    });
  } else if (structureId && structure) {
    structure.tieFormat = prunedTieFormat;
    const result = updateStructureMatchUps({
      updateInProgressMatchUps,
      collectionDefinition,
      structure,
      uuids,
    });
    addedMatchUps.push(...result.newMatchUps);
    targetMatchUps = result.targetMatchUps;

    queueNoficiations({
      modifiedMatchUps: targetMatchUps,
      eventId: event?.eventId,
      modifiedStructureIds,
      tournamentRecord,
      drawDefinition,
      addedMatchUps,
      stack,
    });
  } else if (matchUpId && matchUp) {
    if (!validUpdate({ matchUp, updateInProgressMatchUps }))
      return decorateResult({
        result: { error: CANNOT_MODIFY_TIEFORMAT },
        stack,
      });

    matchUp.tieFormat = prunedTieFormat;
    const newMatchUps: MatchUp[] = generateCollectionMatchUps({
      collectionDefinition,
      matchUp,
      uuids,
    });

    if (!Array.isArray(matchUp.tieMatchUps)) matchUp.tieMatchUps = [];
    matchUp.tieMatchUps.push(...newMatchUps);
    addedMatchUps.push(...newMatchUps);

    queueNoficiations({
      modifiedMatchUps: [matchUp],
      eventId: event?.eventId,
      modifiedStructureIds,
      tournamentRecord,
      drawDefinition,
      addedMatchUps,
      stack,
    });
  } else if (drawDefinition) {
    // all team matchUps in the drawDefinition which do not have tieFormats and where strucures do not have tieFormats should have matchUps added
    drawDefinition.tieFormat = prunedTieFormat;

    for (const structure of drawDefinition.structures ?? []) {
      const result = updateStructureMatchUps({
        updateInProgressMatchUps,
        collectionDefinition,
        structure,
        uuids,
      });
      modifiedStructureIds.push(structure.structureId);
      addedMatchUps.push(...result.newMatchUps);
      targetMatchUps.push(...result.targetMatchUps);
    }

    queueNoficiations({
      modifiedMatchUps: targetMatchUps,
      eventId: event?.eventId,
      tournamentRecord,
      drawDefinition,
      addedMatchUps,
      stack,
    });
  } else {
    return { error: MISSING_DRAW_DEFINITION };
  }

  const auditData = definedAttributes({
    drawId: drawDefinition?.drawId,
    collectionDefinition,
    action: stack,
    structureId,
    matchUpId,
    eventId,
  });
  tieFormatTelemetry({ appliedPolicies, drawDefinition, auditData });

  return {
    tieFormat: prunedTieFormat,
    targetMatchUps,
    addedMatchUps,
    ...SUCCESS,
  };
}

function updateStructureMatchUps({ updateInProgressMatchUps, collectionDefinition, structure, uuids }) {
  const newMatchUps: MatchUp[] = [];
  const matchUps = getAllStructureMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
    structure,
  })?.matchUps;

  // all team matchUps in the structure which are not completed and which have no score value should have matchUps added
  const targetMatchUps = matchUps.filter(
    (matchUp) => validUpdate({ matchUp, updateInProgressMatchUps }) && !matchUp.tieFormat,
  );

  for (const matchUp of targetMatchUps) {
    const tieMatchUps: MatchUp[] = generateCollectionMatchUps({
      collectionDefinition,
      matchUp,
      uuids,
    });

    if (!Array.isArray(matchUp.tieMatchUps)) matchUp.tieMatchUps = [];
    matchUp.tieMatchUps.push(...tieMatchUps);
    newMatchUps.push(...tieMatchUps);
  }
  return { newMatchUps, targetMatchUps };
}

type QueueNotificationsArgs = {
  modifiedStructureIds?: string[];
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  modifiedMatchUps: MatchUp[];
  addedMatchUps: MatchUp[];
  eventId?: string;
  stack: string;
};
function queueNoficiations({
  modifiedStructureIds,
  tournamentRecord,
  modifiedMatchUps,
  drawDefinition,
  addedMatchUps,
  eventId,
  stack,
}: QueueNotificationsArgs) {
  addMatchUpsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    matchUps: addedMatchUps,
    drawDefinition,
    eventId,
  });
  modifiedMatchUps?.forEach((matchUp) => {
    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      drawDefinition,
      context: stack,
      matchUp,
      eventId,
    });
  });
  modifyDrawNotice({
    structureIds: modifiedStructureIds,
    drawDefinition,
    eventId,
  });
}
