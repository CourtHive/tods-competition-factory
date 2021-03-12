import { addDrawDefinitionExtension } from '../governors/tournamentGovernor/addRemoveExtensions';
import { getAppliedPolicies } from '../../drawEngine/governors/policyGovernor/getAppliedPolicies';
import { checkValidEntries } from '../governors/eventGovernor/entries/checkValidEntries';
import { getScaledEntries } from '../governors/eventGovernor/entries/getScaledEntries';
import { getPolicyDefinition } from '../governors/queryGovernor/getPolicyDefinition';
import { addTournamentTimeItem } from '../governors/tournamentGovernor/addTimeItem';
import { allowedDrawTypes } from '../governors/policyGovernor/allowedTypes';
import { tieFormatDefaults } from './tieFormatDefaults';
import drawEngine from '../../drawEngine/sync';

import {
  MAIN,
  ROUND_ROBIN,
  SINGLE_ELIMINATION,
} from '../../constants/drawDefinitionConstants';

import SEEDING_POLICY from '../../fixtures/policies/POLICY_SEEDING_USTA';

import { INVALID_DRAW_TYPE } from '../../constants/errorConditionConstants';
import { RANKING, SEEDING } from '../../constants/scaleConstants';
import { STRUCTURE_ENTERED_TYPES } from '../../constants/entryStatusConstants';
import { TEAM } from '../../constants/matchUpTypes';
import {
  POLICY_TYPE_AVOIDANCE,
  POLICY_TYPE_SEEDING,
} from '../../constants/policyConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function generateDrawDefinition(props) {
  const { tournamentRecord, event } = props;
  let { drawName, structureOptions } = props;

  const {
    uuids,
    drawId,
    drawEntries,
    matchUpType,
    seedingProfile,
    qualifyingRound,
    automated = true,
    policyDefinitions,
    qualifyingPositions,
    drawType = SINGLE_ELIMINATION,
    finishingPositionNaming,
    ignoreAllowedDrawTypes,
    playoffMatchUpFormat,
    feedPolicy,

    seededParticipants,
    seedByRanking = true,
  } = props;

  const participants = tournamentRecord?.participants;

  const validEntriesTest =
    event && participants && checkValidEntries({ event, participants });

  if (validEntriesTest?.error) {
    return validEntriesTest;
  }

  // TODO: review use of allowedDrawTypes

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
  const eventAllowedDrawTypes =
    !ignoreAllowedDrawTypes && event?.allowedDrawTypes;
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

  const stage = MAIN;
  const entries = drawEntries || event?.entries || [];
  const eventType = event?.eventType;
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

  const drawProfile = {
    drawId,
    drawSize,
    drawType,
    automated,
    drawName,
    seedsCount,

    tieFormat,
    matchUpType,

    structureOptions,
    qualifyingRound,
    qualifyingPositions,

    category: event?.category,
  };

  if (!matchUpFormatError) drawProfile.matchUpFormat = matchUpFormat;

  const {
    mappedMatchUps,
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
    goesTo: props.goesTo,
  });

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
      policyType: POLICY_TYPE_AVOIDANCE,
    }) || {};

  const { policyDefinition: eventSeedingPolicy } =
    getPolicyDefinition({
      event,
      policyType: POLICY_TYPE_SEEDING,
    }) || {};

  const { appliedPolicies } = getAppliedPolicies(drawEngine.getState());
  if (!appliedPolicies?.seeding) {
    if (eventSeedingPolicy) {
      drawEngine.attachPolicy({ policyDefinition: eventSeedingPolicy });
    } else {
      drawEngine.attachPolicy({ policyDefinition: SEEDING_POLICY });
    }
  }

  if (!appliedPolicies?.avoidance && eventAvoidancePolicy) {
    drawEngine.attachPolicy({ policyDefinition: eventAvoidancePolicy });
  }

  entries.forEach((entry) => {
    // convenience: assume MAIN as entryStage if none provided
    const entryData = Object.assign({}, entry, {
      entryStage: entry.entryStage || MAIN,
    });
    drawEngine.addDrawEntry(entryData);
  });
  const enteredParticipantIds = entries.map(
    ({ participantId }) => participantId
  );

  if (seedsCount > drawSize) seedsCount = drawSize;
  if (seedsCount > stageEntries.length) seedsCount = stageEntries.length;
  drawEngine.initializeStructureSeedAssignments({ structureId, seedsCount });

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
          console.log('generateDrawDefinition seededParticpants');
          console.log(`%c ${result.error}`, 'color: red');
        }
      });
  } else if (event?.category) {
    // if no seededParticipants have been defined, seed by seeding scale or ranking scale, if present

    const { categoryName, ageCategoryCode } = event.category;

    const seedingScaleAttributes = {
      scaleType: SEEDING,
      scaleName: categoryName || ageCategoryCode,
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
            structureId,
            seedNumber,
            seedValue,
            participantId,
          });
          if (!result.success) {
            console.log('generateDrawDefinition scaledEntries');
            console.log(`%c ${result.error}`, 'color: red');
          }
        });
  }

  let conflicts = [];
  if (automated !== false) {
    ({ conflicts } = drawEngine.automatedPositioning({
      mappedMatchUps,
      structureId,
      participants,
    }));
  }

  const { drawDefinition } = drawEngine.getState();

  const extension = {
    name: 'drawProfile',
    value: drawProfile,
  };
  addDrawDefinitionExtension({ drawDefinition, extension });

  drawName = drawName || drawType;
  if (drawDefinition) Object.assign(drawDefinition, { drawName });

  const errors = generatedDrawErrors || [];
  if (matchUpFormatError) errors.push(matchUpFormat);
  const error = errors.length && errors;

  const drawDetails = {
    drawSize,
    drawType,
    automated,
    drawName,
    seedsCount,
    tieFormat,
    matchUpType,
    drawId: drawDefinition.drawId,
    category: event?.category,
  };

  const timeItem = {
    itemType: 'generateDrawDefinition',
    itemValue: drawDetails,
  };
  addTournamentTimeItem({ tournamentRecord, timeItem });

  return Object.assign({}, SUCCESS, {
    structureId,
    drawDefinition,
    conflicts,
    error,
  });
}
