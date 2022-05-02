import { addVoluntaryConsolationStructure } from '../governors/eventGovernor/addVoluntaryConsolationStructure';
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

import POLICY_SEEDING_USTA from '../../fixtures/policies/POLICY_SEEDING_USTA';
import { INVALID_DRAW_TYPE } from '../../constants/errorConditionConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { TEAM } from '../../constants/matchUpTypes';
import {
  LUCKY_DRAW,
  MAIN,
  QUALIFYING,
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
    ignoreAllowedDrawTypes,
    voluntaryConsolation,
    policyDefinitions,
    tournamentRecord,
    tieFormatName,
    stage = MAIN,
    drawEntries,
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

  let drawTypeResult = generateDrawType({
    ...params,
    tournamentRecord,
    drawDefinition,
    matchUpFormat,
    matchUpType,
    tieFormat,
    drawSize,
  });
  if (drawTypeResult.error) return drawTypeResult;

  // first attach any policyDefinitions which have been provided
  if (typeof policyDefinitions === 'object') {
    attachPolicies({ policyDefinitions, drawDefinition });
  }

  // then check for a seedingPolicy at all levels
  const { policyDefinitions: seedingPolicy } =
    getPolicyDefinitions({
      policyTypes: [POLICY_TYPE_SEEDING],
      tournamentRecord,
      drawDefinition,
      event,
    }) || {};

  // if no seeding policy provided and none present at any other level, attach default
  // this needs to be attached for prepareStage => initializeSeedAssignments
  if (!seedingPolicy?.[POLICY_TYPE_SEEDING]) {
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
    drawDefinition,
    participants,
    seedsCount,
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
    let roundTarget = 1;

    for (const roundTargetProfile of params.qualifyingProfiles.sort(
      roundTargetSort
    )) {
      let stageSequence = 1;
      for (const structureProfile of roundTargetProfile.structureProfiles.sort(
        sequenceSort
      )) {
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
          qualifyingPositions,
          stage: QUALIFYING,
          drawDefinition,
          stageSequence,
          participants,
          roundTarget,
          seedsCount,
          drawSize,
          entries,
        });
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
