import { addVoluntaryConsolationStructure } from '../governors/eventGovernor/addVoluntaryConsolationStructure';
import { validateTieFormat } from '../../drawEngine/governors/scoreGovernor/tieFormats/tieFormatUtilities';
import { generateDrawType } from '../../drawEngine/governors/structureGovernor/generateDrawType';
import { getTournamentParticipants } from '../getters/participants/getTournamentParticipants';
import { setMatchUpFormat } from '../../drawEngine/governors/matchUpGovernor/matchUpFormat';
import { attachPolicies } from '../../drawEngine/governors/policyGovernor/attachPolicies';
import { getAppliedPolicies } from '../../global/functions/deducers/getAppliedPolicies';
import { checkValidEntries } from '../governors/eventGovernor/entries/checkValidEntries';
import { addDrawEntry } from '../../drawEngine/governors/entryGovernor/addDrawEntries';
import { getAllowedDrawTypes } from '../governors/policyGovernor/allowedTypes';
import { decorateResult } from '../../global/functions/decorateResult';
import { newDrawDefinition } from '../../drawEngine/stateMethods';
import { tieFormatDefaults } from './tieFormatDefaults';
import { prepareStage } from './prepareStage';

import POLICY_SEEDING_USTA from '../../fixtures/policies/POLICY_SEEDING_USTA';
import { POLICY_TYPE_SEEDING } from '../../constants/policyConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { TEAM } from '../../constants/matchUpTypes';
import {
  INVALID_DRAW_TYPE,
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../constants/errorConditionConstants';
import {
  LUCKY_DRAW,
  MAIN,
  QUALIFYING,
  SINGLE_ELIMINATION,
} from '../../constants/drawDefinitionConstants';

/**
 * automated = true, // can be true/false or "truthy" { seedsOnly: true }
 */
export function generateDrawDefinition(params) {
  const {
    drawType = SINGLE_ELIMINATION,
    ignoreAllowedDrawTypes,
    voluntaryConsolation,
    policyDefinitions,
    tournamentRecord,
    tieFormatName,
    stage = MAIN,
    drawEntries,
    placeByes,
    drawId,
    event,
  } = params;

  // get participants both for entry validation and for automated placement
  // automated placement requires them to be "inContext" for avoidance policies to work
  const { tournamentParticipants: participants } = getTournamentParticipants({
    tournamentRecord,
    inContext: true,
  });

  // entries participantTypes must correspond with eventType
  // this is only possible if the event is provided
  const validEntriesResult =
    event && participants && checkValidEntries({ event, participants });

  if (validEntriesResult?.error) return validEntriesResult;

  // if tournamentRecord is provided, and unless instructed to ignore valid types,
  // check for restrictions on allowed drawTypes
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

  // coersion of drawSize and seedsCount to integers
  let drawSize =
    typeof params.drawSize !== 'number'
      ? parseInt(params.drawSize || 32)
      : params.drawSize || 32;
  let seedsCount =
    typeof params.seedsCount !== 'number'
      ? parseInt(params.seedsCount || 0)
      : params.seedsCount || 0;

  const eventType = event?.eventType;
  const matchUpType = params.matchUpType || eventType;

  // drawDefinition cannot have both tieFormat and matchUpFormat
  let { tieFormat, matchUpFormat } = params;

  if (tieFormat) {
    const result = validateTieFormat({ tieFormat });
    if (!result.valid)
      return { error: INVALID_VALUES, errors: result.errors, tieFormat };
  }

  if (matchUpType === TEAM && eventType === TEAM) {
    const specifiedTieFormat = tieFormat || event?.tieFormat;
    tieFormat =
      specifiedTieFormat && typeof specifiedTieFormat === 'object'
        ? specifiedTieFormat
        : tieFormatDefaults({ namedFormat: tieFormatName });
    matchUpFormat = undefined;
  } else if (!matchUpFormat) {
    tieFormat = undefined;
    matchUpFormat = 'SET3-S:6/TB7';
  }

  // ---------------------------------------------------------------------------
  // Begin construction of drawDefinition
  const drawDefinition = newDrawDefinition({ drawType, drawId });

  // if there is a defined matchUpFormat/tieFormat only attach to drawDefinition...
  // ...when there is not an equivalent definition on the parent event
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
        tournamentRecord,
        drawDefinition,
        matchUpFormat,
        tieFormat,
        event,
      });

      if (result.error)
        return {
          error: result.error,
          info: 'matchUpFormat or tieFormat error',
        };

      if (matchUpType) drawDefinition.matchUpType = matchUpType;
      if (tieFormat) drawDefinition.tieFormat = tieFormat;

      // update tieFormat if integrity check has added collectionIds
      if (result.tieFormat) tieFormat = result.tieFormat;
    }
  }

  const { appliedPolicies } = getAppliedPolicies({
    tournamentRecord,
    event,
  });

  if (policyDefinitions) {
    if (typeof policyDefinitions !== 'object') {
      return {
        info: 'policyDefinitions must be an object',
        error: INVALID_VALUES,
      };
    } else {
      const policiesToAttach = {};
      for (const key of Object.keys(policyDefinitions)) {
        if (
          JSON.stringify(appliedPolicies[key]) !==
          JSON.stringify(policyDefinitions[key])
        ) {
          policiesToAttach[key] = policyDefinitions[key];
        }
      }

      if (Object.keys(policiesToAttach).length) {
        // attach any policyDefinitions which have been provided and are not already present
        attachPolicies({ drawDefinition, policyDefinitions: policiesToAttach });
        Object.assign(appliedPolicies, policiesToAttach);
      }
    }
  }

  if (!appliedPolicies[POLICY_TYPE_SEEDING]) {
    attachPolicies({ drawDefinition, policyDefinitions: POLICY_SEEDING_USTA });
    Object.assign(appliedPolicies, POLICY_SEEDING_USTA);
  }

  let drawTypeResult = generateDrawType({
    ...params,
    tournamentRecord,
    appliedPolicies,
    drawDefinition,
    matchUpFormat,
    matchUpType,
    tieFormat,
    drawSize,
  });
  if (drawTypeResult.error) return drawTypeResult;

  /*
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
  */

  // add all entries to the draw
  const entries = drawEntries || event?.entries || [];
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
    ...drawTypeResult,
    ...params,
    appliedPolicies,
    drawDefinition,
    participants,
    seedsCount,
    placeByes,
    drawSize,
    entries,
    stage,
  });
  // if (structureResult.error) return structureResult;

  const structureId = structureResult.structureId;
  const conflicts = structureResult.conflicts;
  const qualifyingConflicts = [];

  const sequenceSort = (a, b) => a.stageSequence - b.stageSequence;
  const roundTargetSort = (a, b) => a.roundTarget - b.roundTarget;

  if (params.qualifyingProfiles) {
    // keep track of structures already prepared in case of multiple matching structures
    const preparedStructureIds = [];
    let roundTarget = 1;

    for (const roundTargetProfile of params.qualifyingProfiles.sort(
      roundTargetSort
    )) {
      roundTarget = roundTargetProfile.roundTarget || roundTarget;
      let stageSequence = 1;

      if (!Array.isArray(roundTargetProfile.structureProfiles))
        return decorateResult({
          result: { error: MISSING_VALUE },
          info: 'structureProfiles must be an array',
        });

      const sortedStructureProfiles =
        roundTargetProfile.structureProfiles.sort(sequenceSort) || [];
      for (const structureProfile of sortedStructureProfiles) {
        const {
          qualifyingRoundNumber,
          qualifyingPositions,
          seedsCount = 0,
          drawSize,
        } = structureProfile;

        const qualifyingResult = prepareStage({
          ...drawTypeResult,
          ...params,
          qualifyingRoundNumber,
          preparedStructureIds,
          qualifyingPositions,
          stage: QUALIFYING,
          appliedPolicies,
          drawDefinition,
          stageSequence,
          participants,
          roundTarget,
          seedsCount,
          placeByes,
          drawSize,
          entries,
        });

        if (qualifyingResult.structureId) {
          preparedStructureIds.push(qualifyingResult.structureId);
        }

        // if (qualifyingResult.error) return qualifyingResult;
        stageSequence += 1;

        if (qualifyingResult.conflicts?.length)
          qualifyingConflicts.push(...qualifyingResult.conflicts);
      }

      roundTarget += 1;
    }
  }

  drawDefinition.drawName = params.drawName || drawType;

  if (typeof voluntaryConsolation === 'object') {
    addVoluntaryConsolationStructure({
      ...voluntaryConsolation,
      tournamentRecord,
      appliedPolicies,
      drawDefinition,
      matchUpType,
    });
  }

  return {
    qualifyingConflicts,
    drawDefinition,
    structureId,
    ...SUCCESS,
    conflicts,
  };
}
