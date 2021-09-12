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
import { newDrawDefinition } from '../../drawEngine/stateMethods';
import { tieFormatDefaults } from './tieFormatDefaults';
import { addNotice } from '../../global/globalState';

import { STRUCTURE_ENTERED_TYPES } from '../../constants/entryStatusConstants';
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
 * 
    automated = true, // can be true/false or "truthy" { seedsOnly: true }
 */
export function generateDrawDefinition(params) {
  const { tournamentRecord, event } = params;
  let { drawName, matchUpType, structureOptions } = params;

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
    automated = true,
    qualifyingRound,
    seedingProfile,
    stage = MAIN,
    drawEntries,
    feedPolicy,
    idPrefix,
    drawId,
    uuids,
  } = params;

  const participants = tournamentRecord?.participants;

  const validEntriesTest =
    event && participants && checkValidEntries({ event, participants });

  if (validEntriesTest?.error) {
    return validEntriesTest;
  }

  const tournamentAllowedDrawTypes =
    !ignoreAllowedDrawTypes &&
    tournamentRecord &&
    getAllowedDrawTypes({ tournamentRecord });
  if (
    tournamentAllowedDrawTypes?.length &&
    !tournamentAllowedDrawTypes.includes(drawType)
  ) {
    return { error: INVALID_DRAW_TYPE };
  }

  let { seedsCount, drawSize = 32, tieFormat, matchUpFormat } = params;

  // coersion
  if (typeof drawSize !== 'number') drawSize = parseInt(drawSize);
  if (typeof seedsCount !== 'number') seedsCount = parseInt(seedsCount || 0);

  if (matchUpType === TEAM) {
    tieFormat = tieFormat || tieFormatDefaults();
    matchUpFormat = undefined;
  } else if (!matchUpFormat) {
    tieFormat = undefined;
    matchUpFormat = 'SET3-S:6/TB7';
  }

  const entries = drawEntries || event?.entries || [];
  const eventType = event?.eventType;
  matchUpType = matchUpType || eventType;

  const stageEntries = entries.filter(
    (entry) =>
      (!entry.entryStage || entry.entryStage === stage) &&
      STRUCTURE_ENTERED_TYPES.includes(entry.entryStatus)
  );
  if ([ROUND_ROBIN].includes(drawType)) {
    drawSize = stageEntries.length;
  }

  const drawDefinition = newDrawDefinition({ drawType, drawId });

  setStageDrawSize({ drawDefinition, stage, drawSize });

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
        matchUpType,
      });

      if (result.error)
        return { error: result.error, message: 'matchUpFormat error' };
    } else {
      if (matchUpType) drawDefinition.matchUpType = matchUpType;
    }
  }

  tieFormat = tieFormat || event?.tieFormat;
  let result = generateDrawType({
    drawDefinition,
    matchUpType,
    tieFormat,

    stage,
    drawType,
    seedingProfile,
    structureOptions,
    qualifyingRound,
    qualifyingPositions,

    uuids,
    idPrefix,
    matchUpFormat,
    playoffMatchUpFormat,
    finishingPositionNaming,

    feedPolicy,
    goesTo: params.goesTo,
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
        drawDefinition,
        policyDefinitions: { [policyType]: policyDefinitions[policyType] },
      });
    }
  }

  const { policyDefinitions: seedingPolicy } =
    getPolicyDefinitions({
      tournamentRecord,
      drawDefinition,
      event,
      policyTypes: [POLICY_TYPE_SEEDING],
    }) || {};

  if (!policyDefinitions?.seeding && !seedingPolicy?.seeding) {
    // if there is no seeding policy then use default seeing policy
    attachPolicies({ drawDefinition, policyDefinitions: POLICY_SEEDING_USTA });
  }

  // if an avoidance policy is not passed in at draw generation
  // but an event level avoidance policy exists... attach that to the draw for posterity.
  // because an event level policy COULD be modified or removed AFTER draw is generated...
  const { policyDefinitions: eventAvoidancePolicy } =
    getPolicyDefinitions({
      tournamentRecord,
      drawDefinition,
      event,
      policyTypes: [POLICY_TYPE_AVOIDANCE],
    }) || {};

  if (!policyDefinitions?.avoidance && eventAvoidancePolicy?.avoidance) {
    attachPolicies({ drawDefinition, policyDefinitions: eventAvoidancePolicy });
  }

  // OPTIMIZE: use drawEngine.addDrawEntries
  for (const entry of entries) {
    // convenience: assume MAIN as entryStage if none provided
    const entryData = {
      ...entry,
      entryStage: entry.entryStage || MAIN,
      drawDefinition,
    };
    // NOTE: we don't throw an error if an entry can't be added
    // INVESTIGATE: not entirely sure why this is the case. All but one test passes when error is thrown.
    addDrawEntry(entryData);
  }

  const enteredParticipantIds = entries.map(
    ({ participantId }) => participantId
  );

  if (seededParticipants) seedsCount = seededParticipants.length;
  if (seedsCount > drawSize) seedsCount = drawSize;
  if (seedsCount > stageEntries.length) seedsCount = stageEntries.length;

  const { seedLimit } = initializeStructureSeedAssignments({
    tournamentRecord,
    drawDefinition,
    event,

    participantCount: stageEntries.length,
    enforcePolicyLimits,
    structureId,
    seedsCount,
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

    if (!scaledEntries.length && seedByRanking) {
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
        .slice(0, seedsCount)
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
    drawSize,
    drawType,
    automated,
    drawName,
    seedsCount,
    tieFormat,
    matchUpType,
    seedingScaleName,
    drawId: drawDefinition.drawId,
    category: event?.category,
    eventId: event?.eventId,
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
