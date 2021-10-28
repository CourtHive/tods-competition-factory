import { initializeStructureSeedAssignments } from '../../drawEngine/governors/positionGovernor/initializeSeedAssignments';
import { automatedPositioning } from '../../drawEngine/governors/positionGovernor/automatedPositioning';
import { generateDrawType } from '../../drawEngine/governors/structureGovernor/generateDrawType';
import { setStageDrawSize } from '../../drawEngine/governors/entryGovernor/stageEntryCounts';
import { setMatchUpFormat } from '../../drawEngine/governors/matchUpGovernor/matchUpFormat';
import { checkValidEntries } from '../governors/eventGovernor/entries/checkValidEntries';
import { attachPolicies } from '../../drawEngine/governors/policyGovernor/attachPolicies';
import { addDrawEntry } from '../../drawEngine/governors/entryGovernor/addDrawEntries';
import { getScaledEntries } from '../governors/eventGovernor/entries/getScaledEntries';
import { getPolicyDefinitions } from '../governors/queryGovernor/getPolicyDefinitions';
import { assignSeed } from '../../drawEngine/governors/entryGovernor/seedAssignment';
import { getAllowedDrawTypes } from '../governors/policyGovernor/allowedTypes';
import { getDrawStructures } from '../../drawEngine/getters/structureGetter';
import { getParticipantId } from '../../global/functions/extractors';
import { newDrawDefinition } from '../../drawEngine/stateMethods';
import { tieFormatDefaults } from './tieFormatDefaults';
import { addNotice } from '../../global/globalState';

import { STRUCTURE_SELECTED_STATUSES } from '../../constants/entryStatusConstants';
import POLICY_SEEDING_USTA from '../../fixtures/policies/POLICY_SEEDING_USTA';
import { INVALID_DRAW_TYPE } from '../../constants/errorConditionConstants';
import { RANKING, SEEDING } from '../../constants/scaleConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { AUDIT } from '../../constants/topicConstants';
import { TEAM } from '../../constants/matchUpTypes';
import {
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
    enforcePolicyLimits = true,
    finishingPositionNaming,
    ignoreAllowedDrawTypes,
    seedAssignmentProfile, // mainly used by mocksEngine for scenario testing
    playoffMatchUpFormat,
    seedByRanking = true,
    qualifyingPositions,
    seededParticipants,
    policyDefinitions,
    seedingScaleName,
    assignSeedsCount, // used for testing bye placement next to seeds
    automated = true,
    qualifyingRound,
    seedingProfile,
    tieFormatName,
    stage = MAIN,
    drawEntries,
    feedPolicy,
    idPrefix,
    drawId,
    isMock,
    uuids,
  } = params;

  const { tournamentRecord, event } = params;
  let { drawName, matchUpType, structureOptions } = params;
  const participants = tournamentRecord?.participants;

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
      (!entry.entryStage || entry.entryStage === stage) &&
      STRUCTURE_SELECTED_STATUSES.includes(entry.entryStatus)
  );

  // the reason for this needs to be clarified
  if ([ROUND_ROBIN].includes(drawType)) {
    drawSize = stageEntries.length || drawSize;
  }

  const drawDefinition = newDrawDefinition({ drawType, drawId });
  setStageDrawSize({ drawDefinition, stage, drawSize });

  if (drawEntries) {
    const drawEntryStages = drawEntries
      .reduce(
        (stages, entry) =>
          stages.includes(entry.entryStage)
            ? stages
            : stages.concat(entry.entryStage),
        []
      )
      .filter((entryStage) => entryStage !== stage)
      .filter(Boolean);

    // if (drawEntryStages.length) console.log({ drawEntryStages, drawEntries });
    if (drawEntryStages.length) console.log('drawEntryStages');
  }

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
    } else {
      // if (matchUpType) drawDefinition.matchUpType = matchUpType;
    }
  }

  tieFormat = tieFormat || event?.tieFormat;
  let result = generateDrawType({
    finishingPositionNaming,
    goesTo: params.goesTo,
    playoffMatchUpFormat,
    qualifyingPositions,
    structureOptions,
    qualifyingRound,
    drawDefinition,
    seedingProfile,
    matchUpFormat,
    matchUpType,
    feedPolicy,
    tieFormat,
    drawType,
    idPrefix,
    isMock,
    stage,
    uuids,
  });
  if (result.error) return result;

  const { matchUpsMap, inContextDrawMatchUps } = result;

  const { structures } = getDrawStructures({
    drawDefinition,
    stageSequence: 1,
    stage,
  });
  const [structure] = structures;
  const { structureId } = structure || {};

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

  const enteredParticipantIds = entries.map(getParticipantId);

  if (seededParticipants) seedsCount = seededParticipants.length;
  if (seedsCount > drawSize) seedsCount = drawSize;
  if (seedsCount > stageEntries.length) seedsCount = stageEntries.length;

  const { seedLimit } = initializeStructureSeedAssignments({
    participantCount: stageEntries.length,
    enforcePolicyLimits,
    tournamentRecord,
    drawDefinition,
    structureId,
    seedsCount,
    event,
  });

  if (seedLimit && seedLimit < seedsCount) seedsCount = seedLimit;

  if (seededParticipants) {
    seededParticipants
      .filter(({ participantId }) =>
        enteredParticipantIds.includes(participantId)
      )
      .filter(
        (seededParticipant) =>
          !seededParticipant.seedNumber ||
          seededParticipant.seedNumber <= seededParticipants.length
      )
      .sort((a, b) => {
        if (a.seedNumber < b.seedNumber) return -1;
        if (a.seedNumber < b.seedNumber) return 1;
        return 0;
      })
      .forEach((seededParticipant) => {
        const { participantId, seedNumber, seedValue } = seededParticipant;
        assignSeed({
          drawDefinition,
          participantId,
          structureId,
          seedNumber,
          seedValue,
        });
      });
  } else if (event?.category || seedingScaleName) {
    // if no seededParticipants have been defined, seed by seeding scale or ranking scale, if present

    const { categoryName, ageCategoryCode } = event?.category || {};

    const seedingScaleAttributes = {
      scaleType: SEEDING,
      scaleName: seedingScaleName || categoryName || ageCategoryCode,
      eventType,
    };

    let { scaledEntries } = getScaledEntries({
      scaleAttributes: seedingScaleAttributes,
      tournamentRecord,
      entries,
      stage,
    });

    if (!scaledEntries?.length && seedByRanking) {
      const rankingScaleAttributes = {
        scaleType: RANKING,
        scaleName: categoryName || ageCategoryCode,
        eventType,
      };

      ({ scaledEntries } = getScaledEntries({
        scaleAttributes: rankingScaleAttributes,
        tournamentRecord,
        entries,
        stage,
      }));
    }

    const scaledEntriesCount = scaledEntries?.length || 0;
    if (scaledEntriesCount < seedsCount) seedsCount = scaledEntriesCount;

    scaledEntries &&
      scaledEntries
        .filter(({ participantId }) =>
          enteredParticipantIds.includes(participantId)
        )
        .slice(0, assignSeedsCount || seedsCount)
        .forEach((scaledEntry, index) => {
          const seedNumber = index + 1;
          const seedValue = seedAssignmentProfile?.[seedNumber] || seedNumber;
          // ?? attach basis of seeding information to seedAssignment ??
          const { participantId } = scaledEntry;
          assignSeed({
            drawDefinition,
            participantId,
            structureId,
            seedNumber,
            seedValue,
          });
        });
  }

  let conflicts = [];
  if (automated !== false) {
    const seedsOnly = typeof automated === 'object' && automated.seedsOnly;
    // if { seedsOnly: true } then only seeds and an Byes releated to seeded positions are placed
    ({ conflicts } = automatedPositioning({
      drawDefinition,
      participants,
      structureId,
      seedsOnly,

      inContextDrawMatchUps,
      matchUpsMap,
    }));
  }

  drawName = drawName || drawType;
  if (drawDefinition) Object.assign(drawDefinition, { drawName });

  const drawDetails = {
    drawId: drawDefinition.drawId,
    category: event?.category,
    eventId: event?.eventId,
    seedingScaleName,
    matchUpType,
    seedsCount,
    automated,
    tieFormat,
    drawSize,
    drawType,
    drawName,
  };

  addNotice({
    topic: AUDIT,
    payload: { action: 'generateDrawDefinition', payload: drawDetails },
  });

  return {
    ...SUCCESS,
    structureId,
    drawDefinition,
    conflicts,
  };
}
