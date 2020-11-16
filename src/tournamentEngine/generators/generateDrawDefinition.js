import { tieFormatDefaults } from './tieFormatDefaults';
import { allowedDrawTypes } from '../governors/policyGovernor/allowedTypes';
import { getScaledEntries } from '../governors/eventGovernor/getScaledEntries';
import { checkValidEntries } from '../governors/eventGovernor/checkValidEntries';
import { getAppliedPolicies } from '../../drawEngine/governors/policyGovernor/getAppliedPolicies';

import {
  MAIN,
  ROUND_ROBIN,
  ELIMINATION,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../constants/drawDefinitionConstants';

import SEEDING_POLICY from '../../fixtures/seeding/SEEDING_USTA';

import { INVALID_DRAW_TYPE } from '../../constants/errorConditionConstants';
import { RANKING, SEEDING } from '../../constants/scaleConstants';
import { STRUCTURE_ENTERED_TYPES } from '../../constants/entryStatusConstants';
import { TEAM } from '../../constants/matchUpTypes';

export function generateDrawDefinition(props) {
  const { tournamentRecord, drawEngine, event } = props;
  let { structureOptions } = props;

  const {
    customName,
    matchUpType,
    seedingProfile,
    qualifyingRound,
    automated = true,
    policyDefinitions,
    qualifyingPositions,
    drawType = ELIMINATION,
    playoffMatchUpFormat,
    ignoreAllowedDrawTypes,
    seededParticipants,
  } = props;

  const participants = tournamentRecord?.participants;

  const validEntriesTest =
    event && participants && checkValidEntries({ event, participants });
  if (validEntriesTest?.error) {
    return validEntriesTest;
  }

  const tournamentAllowedDrawTypes =
    !ignoreAllowedDrawTypes &&
    tournamentRecord &&
    allowedDrawTypes({ tournamentRecord });
  if (
    tournamentAllowedDrawTypes &&
    !tournamentAllowedDrawTypes.includes(drawType)
  ) {
    return { error: INVALID_DRAW_TYPE };
  }
  const eventAllowedDrawTypes = event?.allowedDrawTypes;
  if (eventAllowedDrawTypes && !eventAllowedDrawTypes.includes(drawType)) {
    return { error: INVALID_DRAW_TYPE };
  }

  let { seedsCount, drawSize = 32, tieFormat, matchUpFormat } = props;

  // coersion
  if (typeof drawSize !== 'number') drawSize = parseInt(drawSize);
  if (typeof seedsCount !== 'number') seedsCount = parseInt(seedsCount || 0);

  if (tieFormat || (matchUpType === TEAM && !tieFormat)) {
    tieFormat = tieFormatDefaults();
    matchUpFormat = undefined;
  } else if (!matchUpFormat) {
    tieFormat = undefined;
    matchUpFormat = 'SET3-S:6/TB7';
  }

  const drawProfile = {
    drawType,
    drawSize,
    automated,
    customName,
    seedsCount,

    tieFormat,
    matchUpType,

    structureOptions,
    qualifyingRound,
    qualifyingPositions,

    category: event?.category,
  };

  const stage = MAIN;
  const entries = event?.entries || [];
  const eventType = event?.eventType;
  const drawIsRRWP = drawType === ROUND_ROBIN_WITH_PLAYOFF;
  const stageEntries = entries.filter(
    entry =>
      entry.entryStage === stage &&
      STRUCTURE_ENTERED_TYPES.includes(entry.entryStatus)
  );
  if ([ROUND_ROBIN].includes(drawType)) {
    drawSize = stageEntries.length;
  }

  if (drawIsRRWP && !structureOptions) {
    structureOptions = drawIsRRWP
      ? {
          playoffGroups: [
            { finishingPositions: [1, 2], structureName: 'Playoffs' },
          ],
        }
      : undefined;
  }

  drawEngine.reset();
  drawEngine.newDrawDefinition({ drawProfile });

  drawEngine.setStageDrawSize({ stage, drawSize });
  const { error: matchUpFormatError } = drawEngine.setMatchUpFormat({
    matchUpFormat,
    tieFormat,
    matchUpType,
  });
  if (!matchUpFormatError) drawProfile.matchUpFormat = matchUpFormat;

  drawEngine.generateDrawType({
    stage,
    drawType,
    seedingProfile,
    structureOptions,
    qualifyingRound,
    qualifyingPositions,

    matchUpFormat,
    playoffMatchUpFormat,
  });

  const { structures } = drawEngine.getDrawStructures({
    stage,
    stageSequence: 1,
  });
  const [structure] = structures;
  const { structureId } = structure || {};

  if (Array.isArray(policyDefinitions)) {
    policyDefinitions.forEach(policyDefinition => {
      drawEngine.attachPolicy({ policyDefinition });
    });
  }

  const { appliedPolicies } = getAppliedPolicies(drawEngine.getState());
  if (!appliedPolicies?.seeding) {
    drawEngine.attachPolicy({ policyDefinition: SEEDING_POLICY });
  }

  entries.forEach(entry => {
    // convenience: assume MAIN as entryStage if none provided
    const entryData = Object.assign({}, entry, {
      entryStage: entry.entryStage || MAIN,
    });
    drawEngine.addDrawEntry(entryData);
  });

  if (seedsCount > drawSize) seedsCount = drawSize;
  if (seedsCount > stageEntries.length) seedsCount = stageEntries.length;
  drawEngine.initializeStructureSeedAssignments({ structureId, seedsCount });

  if (seededParticipants) {
    seededParticipants
      .filter(
        seededParticipant =>
          !seededParticipant.seedNumber ||
          seededParticipant.seedNumber > seededParticipants.length
      )
      .sort((a, b) => {
        if (a.seedValue < b.seedValue) return -1;
        if (a.seedValue < b.seedValue) return 1;
        return 0;
      })
      .forEach(seededParticipant => {
        const { participantId, seedNumber, seedValue } = seededParticipant;
        const result = drawEngine.assignSeed({
          structureId,
          seedNumber,
          seedValue,
          participantId,
        });
        if (!result.success) console.log(`%c ${result.error}`, 'color: red');
      });
  } else if (event?.category) {
    // if no seededParticipants have been defined, seed by seeding scale or ranking scale, if present

    const seedingScaleAttributes = {
      scaleType: SEEDING,
      scaleName: event.category.categoryName,
      eventType,
    };

    const rankingScaleAttributes = {
      scaleType: RANKING,
      scaleName: event.category.categoryName,
      eventType,
    };

    const { scaledEntries: seedingScaledEntries } = getScaledEntries({
      scaleAttributes: seedingScaleAttributes,
      tournamentRecord,
      event,
      stage,
    });

    const { scaledEntries: rankingScaledEntries } = getScaledEntries({
      scaleAttributes: rankingScaleAttributes,
      tournamentRecord,
      event,
      stage,
    });

    // Attempt to seed based on seeding scaled entries and then rank scaled entries
    const scaledEntries = seedingScaledEntries?.length
      ? seedingScaledEntries
      : rankingScaledEntries;

    if (scaledEntries.length < seedsCount) seedsCount = scaledEntries.length;

    scaledEntries.slice(0, seedsCount).forEach((scaledEntry, index) => {
      const seedNumber = index + 1;
      const seedValue = seedNumber;
      // TODO: attach basis of seeding information to seedAssignment
      const { participantId } = scaledEntry;
      const result = drawEngine.assignSeed({
        structureId,
        seedNumber,
        seedValue,
        participantId,
      });
      if (!result.success) console.log(`%c ${result.error}`, 'color: red');
    });
  }

  let conflicts = [];
  if (automated !== false) {
    ({ conflicts } = drawEngine.automatedPositioning({
      structureId,
      participants,
    }));
  }

  const { drawDefinition } = drawEngine.getState();

  const drawName = customName || drawType;
  if (drawDefinition) Object.assign(drawDefinition, { drawName });

  // TODO: extend to aggregate other possible (non fatal) errors
  const error = matchUpFormatError
    ? [{ error: matchUpFormatError }]
    : undefined;

  return { structureId, drawDefinition, conflicts, error };
}
