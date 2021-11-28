import { generateDrawType } from '../../drawEngine/governors/structureGovernor/generateDrawType';
import { getTournamentParticipants } from '../getters/participants/getTournamentParticipants';
import { setMatchUpFormat } from '../../drawEngine/governors/matchUpGovernor/matchUpFormat';
import { checkValidEntries } from '../governors/eventGovernor/entries/checkValidEntries';
import { attachPolicies } from '../../drawEngine/governors/policyGovernor/attachPolicies';
import { addDrawEntry } from '../../drawEngine/governors/entryGovernor/addDrawEntries';
import { getPolicyDefinitions } from '../governors/queryGovernor/getPolicyDefinitions';
import { getAllowedDrawTypes } from '../governors/policyGovernor/allowedTypes';
import { newDrawDefinition } from '../../drawEngine/stateMethods';
import { tieFormatDefaults } from './tieFormatDefaults';
import { prepareStage } from './prepareStage';

import { STRUCTURE_SELECTED_STATUSES } from '../../constants/entryStatusConstants';
import POLICY_SEEDING_USTA from '../../fixtures/policies/POLICY_SEEDING_USTA';
import { INVALID_DRAW_TYPE } from '../../constants/errorConditionConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { TEAM } from '../../constants/matchUpTypes';
import {
  LUCKY_DRAW,
  MAIN,
  ROUND_ROBIN,
  SINGLE_ELIMINATION,
} from '../../constants/drawDefinitionConstants';
import {
  POLICY_TYPE_AVOIDANCE,
  POLICY_TYPE_SEEDING,
} from '../../constants/policyConstants';

/**
 * automated = true, // can be true/false or "truthy" { seedsOnly: true }
 */
export function generateDrawDefinition(params) {
  const {
    drawType = SINGLE_ELIMINATION,
    finishingPositionNaming,
    ignoreAllowedDrawTypes,
    playoffMatchUpFormat,
    qualifyingProfiles,
    policyDefinitions,
    seedingProfile,
    tieFormatName,
    drawEntries,
    feedPolicy,
    idPrefix,
    drawId,
    isMock,
    uuids,
  } = params;

  const { tournamentRecord, event } = params;
  let { drawName, matchUpType, structureOptions } = params;

  const { tournamentParticipants: participants } = getTournamentParticipants({
    tournamentRecord,
    inContext: true,
  });

  const validEntriesTest =
    event && participants && checkValidEntries({ event, participants });

  if (validEntriesTest?.error) {
    return validEntriesTest;
  }

  const allowedDrawTypes =
    !ignoreAllowedDrawTypes &&
    tournamentRecord &&
    getAllowedDrawTypes({
      tournamentRecord,
      categoryType: event?.categoryType,
      categoryName: event?.categoryName,
    });
  if (allowedDrawTypes?.length && !allowedDrawTypes.includes(drawType)) {
    return { error: INVALID_DRAW_TYPE };
  }

  let { seedsCount, drawSize = 32, tieFormat, matchUpFormat } = params;

  // coersion
  if (typeof drawSize !== 'number') drawSize = parseInt(drawSize);
  if (typeof seedsCount !== 'number') seedsCount = parseInt(seedsCount || 0);

  const eventType = event?.eventType;
  matchUpType = matchUpType || eventType;

  if (matchUpType === TEAM && eventType === TEAM) {
    tieFormat =
      tieFormat || event?.tieFormat || tieFormatName
        ? typeof tieFormat === 'object'
          ? tieFormat
          : tieFormatName
          ? tieFormatDefaults({ namedFormat: tieFormatName })
          : typeof event?.tieFormat === 'object' && event.tieFormat
        : tieFormatDefaults();
    matchUpFormat = undefined;
  } else if (!matchUpFormat) {
    tieFormat = undefined;
    matchUpFormat = 'SET3-S:6/TB7';
  }

  const entries = drawEntries || event?.entries || [];
  const stageEntries = entries.filter(
    (entry) =>
      (!entry.entryStage || entry.entryStage === MAIN) &&
      STRUCTURE_SELECTED_STATUSES.includes(entry.entryStatus)
  );

  // the reason for this needs to be clarified
  if ([ROUND_ROBIN].includes(drawType)) {
    drawSize = stageEntries.length || drawSize;
  }

  const drawDefinition = newDrawDefinition({ drawType, drawId });

  if (matchUpFormat || tieFormat) {
    let equivalentInScope =
      (matchUpFormat && event?.matchUpFormat === matchUpFormat) ||
      (event?.tieFormat &&
        tieFormat &&
        JSON.stringify(event.tieFormat) === JSON.stringify(tieFormat));

    // if an equivalent matchUpFormat or tieFormat is attached to the event
    // there is no need to attach to the drawDefinition
    if (!equivalentInScope) {
      let result = setMatchUpFormat({
        drawDefinition,
        matchUpFormat,
        tieFormat,
        event,
      });

      if (result.error)
        return {
          error: result.error,
          message: 'matchUpFormat or tieFormat error',
        };

      if (matchUpType) drawDefinition.matchUpType = matchUpType;
      if (tieFormat) drawDefinition.tieFormat = tieFormat;

      // update tieFormat if integrity check has added collectionIds
      if (result.tieFormat) tieFormat = result.tieFormat;
    }
  }

  tieFormat = tieFormat || event?.tieFormat;
  let result = generateDrawType({
    finishingPositionNaming,
    goesTo: params.goesTo,
    playoffMatchUpFormat,
    qualifyingProfiles,
    structureOptions,
    drawDefinition,
    seedingProfile,
    matchUpFormat,
    matchUpType,
    feedPolicy,
    tieFormat,
    drawSize,
    drawType,
    idPrefix,
    isMock,
    uuids,
  });
  if (result.error) return result;

  const { matchUpsMap, inContextDrawMatchUps } = result;

  if (typeof policyDefinitions === 'object') {
    for (const policyType of Object.keys(policyDefinitions)) {
      attachPolicies({
        policyDefinitions: { [policyType]: policyDefinitions[policyType] },
        drawDefinition,
      });
    }
  }

  const { policyDefinitions: seedingPolicy } =
    getPolicyDefinitions({
      policyTypes: [POLICY_TYPE_SEEDING],
      tournamentRecord,
      drawDefinition,
      event,
    }) || {};

  if (
    !policyDefinitions?.[POLICY_TYPE_SEEDING] &&
    !seedingPolicy?.[POLICY_TYPE_SEEDING]
  ) {
    // if there is no seeding policy then use default seeing policy
    attachPolicies({ drawDefinition, policyDefinitions: POLICY_SEEDING_USTA });
  }

  // if an avoidance policy is not passed in at draw generation
  // but an event level avoidance policy exists... attach that to the draw for posterity.
  // because an event level policy COULD be modified or removed AFTER draw is generated...
  const { policyDefinitions: eventAvoidancePolicy } =
    getPolicyDefinitions({
      policyTypes: [POLICY_TYPE_AVOIDANCE],
      tournamentRecord,
      drawDefinition,
      event,
    }) || {};

  if (
    !policyDefinitions?.[POLICY_TYPE_AVOIDANCE] &&
    eventAvoidancePolicy?.[POLICY_TYPE_AVOIDANCE]
  ) {
    attachPolicies({ drawDefinition, policyDefinitions: eventAvoidancePolicy });
  }

  for (const entry of entries) {
    // convenience: assume MAIN as entryStage if none provided
    const entryData = {
      ...entry,
      entryStage: entry.entryStage || MAIN,
      drawDefinition,
    };
    const result = addDrawEntry(entryData);
    if (drawEntries && result.error) {
      // only report errors with drawEntries
      // if entries are taken from event.entries assume stageSpace is not available
      return result;
    }
  }

  // temporary until seeding is supported in LUCKY_DRAW
  if (drawType === LUCKY_DRAW) seedsCount = 0;

  const structureResult = prepareStage({
    ...params,
    inContextDrawMatchUps,
    drawDefinition,
    participants,
    matchUpsMap,
    stage: MAIN,
    seedsCount,
    drawSize,
    entries,
  });

  const conflicts = structureResult.conflicts;
  const structureId = structureResult.structureId;
  seedsCount = structureResult.seedsCount;

  drawName = drawName || drawType;
  if (drawDefinition) Object.assign(drawDefinition, { drawName });

  return {
    drawDefinition,
    structureId,
    ...SUCCESS,
    conflicts,
  };
}
