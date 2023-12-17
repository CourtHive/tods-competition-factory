import { refreshEntryPositions } from '../../../global/functions/producers/refreshEntryPositions';
import { addExtension } from '../../../mutate/extensions/addExtension';
import { isValidExtension } from '../../../validators/isValidExtension';
import { decorateResult } from '../../../global/functions/decorateResult';
import { definedAttributes } from '../../../utilities/definedAttributes';
import { modifyDrawNotice } from '../../../mutate/notifications/drawNotifications';
import { participantInEntries } from '../../getters/entryGetter';
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
  AD_HOC,
  MAIN,
  VOLUNTARY_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';
import {
  DrawDefinition,
  Entry,
  EntryStatusUnion,
  Extension,
  Participant,
  StageTypeUnion,
} from '../../../types/tournamentTypes';
import {
  DIRECT_ACCEPTANCE,
  LUCKY_LOSER,
} from '../../../constants/entryStatusConstants';

type AddDrawEntryArgs = {
  entryStatus?: EntryStatusUnion;
  drawDefinition: DrawDefinition;
  entryStageSequence?: number;
  ignoreStageSpace?: boolean;
  entryStage?: StageTypeUnion;
  participant?: Participant;
  extensions?: Extension[];
  entryPosition?: number;
  extension?: Extension;
  participantId: string;
  roundTarget?: number;
  drawType?: string;
};

export function addDrawEntry(params: AddDrawEntryArgs) {
  const {
    entryStatus = DIRECT_ACCEPTANCE,
    entryStageSequence,
    entryStage = MAIN,
    ignoreStageSpace,
    drawDefinition,
    entryPosition,
    participant,
    roundTarget,
    extensions,
    extension,
    drawType,
  } = params;

  const stack = 'addDrawEntry';
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!entryStage) return { error: MISSING_STAGE };
  if (
    drawType !== AD_HOC &&
    !getValidStage({ stage: entryStage, drawDefinition })
  ) {
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
    entryStatus === LUCKY_LOSER &&
    participantInEntries({ participantId, drawDefinition, entryStatus });
  const invalidVoluntaryConsolation =
    entryStage === VOLUNTARY_CONSOLATION &&
    participantInEntries({
      participantId,
      drawDefinition,
      entryStage,
    });
  const invalidEntry =
    entryStatus !== LUCKY_LOSER &&
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
  entryStatus?: EntryStatusUnion;
  drawDefinition: DrawDefinition;
  autoEntryPositions?: boolean;
  ignoreStageSpace?: boolean;
  participantIds: string[];
  stageSequence?: number;
  extension?: Extension;
  stage?: StageTypeUnion;
  roundTarget?: number;
};

export function addDrawEntries(params: AddDrawEntriesArgs) {
  const stack = 'addDrawEntries';
  const {
    entryStatus = DIRECT_ACCEPTANCE,
    stage = MAIN,
    autoEntryPositions = true,
    ignoreStageSpace,
    drawDefinition,
    participantIds,
    stageSequence,
    roundTarget,
    extension,
  } = params;

  if (!stage) return { error: MISSING_STAGE };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!Array.isArray(participantIds)) return { error: INVALID_PARTICIPANT_IDS };
  if (!getValidStage({ stage, drawDefinition })) {
    return { error: INVALID_STAGE };
  }

  if (extension && !isValidExtension({ extension })) {
    return decorateResult({
      result: { error: INVALID_VALUES },
      info: 'Invalid extension',
      context: { extension },
      stack,
    });
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
  const positionsAvailable = spaceAvailable.positionsAvailable ?? 0;
  if (
    !ignoreStageSpace &&
    stage !== VOLUNTARY_CONSOLATION &&
    positionsAvailable < participantIds.length
  )
    return { error: PARTICIPANT_COUNT_EXCEEDS_DRAW_SIZE };

  const participantIdsNotAdded = participantIds.reduce(
    (notAdded: string[], participantId) => {
      const invalidLuckyLoser =
        entryStatus === LUCKY_LOSER &&
        participantInEntries({ participantId, drawDefinition, entryStatus });
      const invalidVoluntaryConsolation =
        stage === VOLUNTARY_CONSOLATION &&
        participantInEntries({
          entryStage: stage,
          drawDefinition,
          participantId,
        });
      const invalidEntry =
        entryStatus !== LUCKY_LOSER &&
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
      if (extension) {
        addExtension({ element: entry, extension });
      }
      if (roundTarget) {
        addExtension({
          extension: { name: ROUND_TARGET, value: roundTarget },
          element: entry,
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
