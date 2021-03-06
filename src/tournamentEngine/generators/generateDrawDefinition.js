import { checkValidEntries } from '../governors/eventGovernor/entries/checkValidEntries';
import { getScaledEntries } from '../governors/eventGovernor/entries/getScaledEntries';
import { getPolicyDefinition } from '../governors/queryGovernor/getPolicyDefinition';
import { getAllowedDrawTypes } from '../governors/policyGovernor/allowedTypes';
import { tieFormatDefaults } from './tieFormatDefaults';
import { addNotice } from '../../global/globalState';
import drawEngine from '../../drawEngine/sync';

import { STRUCTURE_ENTERED_TYPES } from '../../constants/entryStatusConstants';
import { INVALID_DRAW_TYPE } from '../../constants/errorConditionConstants';
import SEEDING_POLICY from '../../fixtures/policies/POLICY_SEEDING_USTA';
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

export function generateDrawDefinition(params) {
  const { tournamentRecord, event } = params;
  let { drawName, matchUpType, structureOptions } = params;

  const {
    uuids,
    drawId,
    drawEntries,
    stage = MAIN,
    seedingProfile,
    qualifyingRound,
    automated = true, // can be true/false or "truthy" { seedsOnly: true }
    policyDefinitions,
    qualifyingPositions,
    enforcePolicyLimits = true,
    drawType = SINGLE_ELIMINATION,
    finishingPositionNaming,
    ignoreAllowedDrawTypes,
    playoffMatchUpFormat,
    feedPolicy,

    seededParticipants,
    seedByRanking = true,
    seedingScaleName,
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
  matchUpType = matchUpType || (eventType !== TEAM && eventType);

  const stageEntries = entries.filter(
    (entry) =>
      (!entry.entryStage || entry.entryStage === stage) &&
      STRUCTURE_ENTERED_TYPES.includes(entry.entryStatus)
  );
  if ([ROUND_ROBIN].includes(drawType)) {
    drawSize = stageEntries.length;
  }

  drawEngine.reset();
  drawEngine.newDrawDefinition({ drawType, drawId });

  drawEngine.setStageDrawSize({ stage, drawSize });
  const { error: matchUpFormatError } = drawEngine.setMatchUpFormat({
    matchUpFormat,
    tieFormat,
    matchUpType,
  });

  if (matchUpFormatError)
    return { error: matchUpFormatError, message: 'matchUpFormat error' };

  const {
    matchUpsMap,
    inContextDrawMatchUps,
    errors: generatedDrawErrors,
  } = drawEngine.generateDrawType({
    stage,
    drawType,
    seedingProfile,
    structureOptions,
    qualifyingRound,
    qualifyingPositions,

    uuids,
    matchUpFormat,
    playoffMatchUpFormat,
    finishingPositionNaming,

    feedPolicy,
    goesTo: params.goesTo,
  });

  if (generatedDrawErrors)
    return { error: generatedDrawErrors, message: 'generated draw type error' };

  const { structures } = drawEngine.getDrawStructures({
    stage,
    stageSequence: 1,
  });
  const [structure] = structures;
  const { structureId } = structure || {};

  if (Array.isArray(policyDefinitions)) {
    policyDefinitions.forEach((policyDefinition) => {
      drawEngine.attachPolicy({ policyDefinition });
    });
  }

  const { policyDefinition: eventAvoidancePolicy } =
    getPolicyDefinition({
      event,
      tournamentRecord,
      policyType: POLICY_TYPE_AVOIDANCE,
    }) || {};

  const { policyDefinition: eventSeedingPolicy } =
    getPolicyDefinition({
      event,
      tournamentRecord,
      policyType: POLICY_TYPE_SEEDING,
    }) || {};

  if (!policyDefinitions?.seeding && !eventSeedingPolicy) {
    // if there is no seeding policy then use default seeing policy
    drawEngine.attachPolicy({ policyDefinition: SEEDING_POLICY });
  }

  if (!policyDefinitions?.avoidance && eventAvoidancePolicy) {
    drawEngine.attachPolicy({ policyDefinition: eventAvoidancePolicy });
  }

  // OPTIMIZE: use drawEngine.addDrawEntries
  entries.forEach((entry) => {
    // convenience: assume MAIN as entryStage if none provided
    const entryData = {
      ...entry,
      entryStage: entry.entryStage || MAIN,
    };
    drawEngine.addDrawEntry(entryData);
  });

  const enteredParticipantIds = entries.map(
    ({ participantId }) => participantId
  );

  if (seedsCount > drawSize) seedsCount = drawSize;
  if (seedsCount > stageEntries.length) seedsCount = stageEntries.length;

  const { seedLimit } = drawEngine.initializeStructureSeedAssignments({
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
          seededParticipant.seedNumber > seededParticipants.length
      )
      .sort((a, b) => {
        if (a.seedValue < b.seedValue) return -1;
        if (a.seedValue < b.seedValue) return 1;
        return 0;
      })
      .forEach((seededParticipant) => {
        const { participantId, seedNumber, seedValue } = seededParticipant;
        const result = drawEngine.assignSeed({
          structureId,
          seedNumber,
          seedValue,
          participantId,
        });
        if (!result.success) {
          console.log('generateDrawDefinition seededParticipants');
          console.log(`%c ${result.error}`, 'color: red');
        }
      });
  } else if (event?.category || seedingScaleName) {
    // if no seededParticipants have been defined, seed by seeding scale or ranking scale, if present

    const { categoryName, ageCategoryCode } = event?.category || {};

    const seedingScaleAttributes = {
      scaleType: SEEDING,
      scaleName: seedingScaleName || categoryName || ageCategoryCode,
      eventType,
    };

    const rankingScaleAttributes = {
      scaleType: RANKING,
      scaleName: categoryName || ageCategoryCode,
      eventType,
    };

    const { scaledEntries: seedingScaledEntries } = getScaledEntries({
      scaleAttributes: seedingScaleAttributes,
      tournamentRecord,
      entries,
      stage,
    });

    const { scaledEntries: rankingScaledEntries } = getScaledEntries({
      scaleAttributes: rankingScaleAttributes,
      tournamentRecord,
      entries,
      stage,
    });

    // Attempt to seed based on seeding scaled entries and then rank scaled entries
    const scaledEntries = seedingScaledEntries?.length
      ? seedingScaledEntries
      : (seedByRanking && rankingScaledEntries) || [];

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
          const seedValue = seedNumber;
          // TODO: attach basis of seeding information to seedAssignment
          const { participantId } = scaledEntry;
          const result = drawEngine.assignSeed({
            participantId,
            structureId,
            seedNumber,
            seedValue,
          });
          if (!result.success) {
            console.log('generateDrawDefinition scaledEntries');
            console.log(`%c ${result.error} ${seedNumber}`, 'color: red');
          }
        });
  }

  let conflicts = [];
  if (automated !== false) {
    const seedsOnly = typeof automated === 'object' && automated.seedsOnly;
    // if { seedsOnly: true } then only seeds and an Byes releated to seeded positions are placed
    ({ conflicts } = drawEngine.automatedPositioning({
      participants,
      structureId,
      seedsOnly,

      inContextDrawMatchUps,
      matchUpsMap,
    }));
  }

  const { drawDefinition } = drawEngine.getState();

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
