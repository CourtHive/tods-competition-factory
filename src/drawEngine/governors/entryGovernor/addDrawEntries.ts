import { refreshEntryPositions } from '../../../global/functions/producers/refreshEntryPositions';
import { addExtension } from '../../../global/functions/producers/addExtension';
import { isValidExtension } from '../../../global/validation/isValidExtension';
import { decorateResult } from '../../../global/functions/decorateResult';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { participantInEntries } from '../../getters/entryGetter';
import { definedAttributes } from '../../../utilities/objects';
import { getValidStage } from '../../getters/getValidStage';
import { getStageSpace } from '../../getters/getStageSpace';

import { ROUND_TARGET } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_STAGE,
  MISSING_STAGE,
  EXISTING_PARTICIPANT,
  MISSING_DRAW_DEFINITION,
  INVALID_PARTICIPANT_IDS,
  MISSING_PARTICIPANT_ID,
  PARTICIPANT_COUNT_EXCEEDS_DRAW_SIZE,
  INVALID_VALUES,
} from '../../../constants/errorConditionConstants';
import {
  MAIN,
  VOLUNTARY_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';
import {
  DrawDefinition,
  Entry,
  EntryStatusEnum,
  Extension,
  Participant,
  StageTypeEnum,
} from '../../../types/tournamentFromSchema';

type AddDrawEntryArgs = {
  entryStatus?: EntryStatusEnum;
  drawDefinition: DrawDefinition;
  entryStageSequence?: number;
  ignoreStageSpace?: boolean;
  entryStage?: StageTypeEnum;
  participant?: Participant;
  extensions?: Extension[];
  entryPosition?: number;
  extension?: Extension;
  participantId: string;
  roundTarget?: number;
};

export function addDrawEntry(params: AddDrawEntryArgs) {
  const {
    entryStatus = EntryStatusEnum.DirectAcceptance,
    entryStageSequence,
    entryStage = MAIN,
    ignoreStageSpace,
    drawDefinition,
    entryPosition,
    participant,
    roundTarget,
    extensions,
    extension,
  } = params;

  const stack = 'addDrawEntry';
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!entryStage) return { error: MISSING_STAGE };
  if (!getValidStage({ stage: entryStage, drawDefinition })) {
    return decorateResult({ result: { error: INVALID_STAGE }, stack });
  }
  const spaceAvailable = getStageSpace({
    stageSequence: entryStageSequence,
    stage: entryStage,
    drawDefinition,
    entryStatus,
  });
  if (!ignoreStageSpace && !spaceAvailable.success) {
    return { error: spaceAvailable.error };
  }

  if (extension && !isValidExtension({ extension }))
    return decorateResult({
      result: { error: INVALID_VALUES },
      info: 'Invalid extension',
      context: { extension },
      stack,
    });

  const participantId = params.participantId || participant?.participantId;
  if (!participantId)
    return decorateResult({ result: { error: MISSING_PARTICIPANT_ID }, stack });

  const invalidLuckyLoser =
    entryStatus === EntryStatusEnum.LuckyLoser &&
    participantInEntries({ participantId, drawDefinition, entryStatus });
  const invalidVoluntaryConsolation =
    entryStage === VOLUNTARY_CONSOLATION &&
    participantInEntries({
      participantId,
      drawDefinition,
      entryStage,
    });
  const invalidEntry =
    entryStatus !== EntryStatusEnum.LuckyLoser &&
    entryStage !== VOLUNTARY_CONSOLATION &&
    participantInEntries({ drawDefinition, participantId });

  if (invalidEntry || invalidLuckyLoser || invalidVoluntaryConsolation) {
    return decorateResult({
      context: { invalidEntry, invalidLuckyLoser, invalidVoluntaryConsolation },
      result: { error: EXISTING_PARTICIPANT },
      stack,
    });
  }

  const entry = definedAttributes({
    entryStageSequence,
    participantId,
    entryPosition,
    entryStatus,
    entryStage,
    extensions,
  });

  if (extension) {
    addExtension({ element: entry, extension });
  }

  if (roundTarget) {
    addExtension({
      extension: { name: 'roundEntry', value: roundTarget },
      element: entry,
    });
  }

  if (!drawDefinition.entries) drawDefinition.entries = [];
  drawDefinition.entries.push(entry);
  modifyDrawNotice({ drawDefinition });

  return { ...SUCCESS };
}

type AddDrawEntriesArgs = {
  entryStatus?: EntryStatusEnum;
  drawDefinition: DrawDefinition;
  autoEntryPositions?: boolean;
  ignoreStageSpace?: boolean;
  participantIds: string[];
  stageSequence?: number;
  stage?: StageTypeEnum;
  roundTarget?: number;
};

export function addDrawEntries(params: AddDrawEntriesArgs) {
  const {
    entryStatus = EntryStatusEnum.DirectAcceptance,
    stage = StageTypeEnum.Main,
    autoEntryPositions = true,
    ignoreStageSpace,
    drawDefinition,
    participantIds,
    stageSequence,
    roundTarget,
  } = params;

  if (!stage) return { error: MISSING_STAGE };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!Array.isArray(participantIds)) return { error: INVALID_PARTICIPANT_IDS };
  if (!getValidStage({ stage, drawDefinition })) {
    return { error: INVALID_STAGE };
  }

  const spaceAvailable = getStageSpace({
    drawDefinition,
    stageSequence,
    entryStatus,
    stage,
  });
  if (!ignoreStageSpace && !spaceAvailable.success) {
    return { error: spaceAvailable.error };
  }
  const positionsAvailable = spaceAvailable.positionsAvailable || 0;
  if (
    !ignoreStageSpace &&
    stage !== VOLUNTARY_CONSOLATION &&
    positionsAvailable < participantIds.length
  )
    return { error: PARTICIPANT_COUNT_EXCEEDS_DRAW_SIZE };

  const participantIdsNotAdded = participantIds.reduce(
    (notAdded: string[], participantId) => {
      const invalidLuckyLoser =
        entryStatus === EntryStatusEnum.LuckyLoser &&
        participantInEntries({ participantId, drawDefinition, entryStatus });
      const invalidVoluntaryConsolation =
        stage === VOLUNTARY_CONSOLATION &&
        participantInEntries({
          entryStage: stage,
          drawDefinition,
          participantId,
        });
      const invalidEntry =
        entryStatus !== EntryStatusEnum.LuckyLoser &&
        stage !== VOLUNTARY_CONSOLATION &&
        participantInEntries({ drawDefinition, participantId });

      if (invalidEntry || invalidLuckyLoser || invalidVoluntaryConsolation) {
        return notAdded.concat(participantId);
      }
      return notAdded;
    },
    []
  );

  participantIds
    .filter(
      (participantId) =>
        participantId && !participantIdsNotAdded.includes(participantId)
    )
    .forEach((participantId) => {
      const entry: Entry = {
        entryStageSequence: stageSequence,
        entryStage: stage,
        participantId,
        entryStatus,
      };
      if (roundTarget) {
        addExtension({
          element: entry,
          extension: { name: ROUND_TARGET, value: roundTarget },
        });
      }
      if (!drawDefinition.entries) drawDefinition.entries = [];
      drawDefinition.entries.push(entry);
    });

  if (autoEntryPositions) {
    drawDefinition.entries = refreshEntryPositions({
      entries: drawDefinition.entries,
    });
  }

  modifyDrawNotice({ drawDefinition });

  return participantIdsNotAdded?.length
    ? {
        info: 'some participantIds could not be added',
        participantIdsNotAdded,
        ...SUCCESS,
      }
    : { ...SUCCESS };
}
