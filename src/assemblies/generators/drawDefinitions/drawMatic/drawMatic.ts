import { participantScaleItem } from '../../../../query/participant/participantScaleItem';
import { generateDrawMaticRound, DrawMaticRoundResult } from './generateDrawMaticRound';
import { getParticipantId } from '../../../../global/functions/extractors';
import { isAdHoc } from '../../../../query/drawDefinition/isAdHoc';
import { generateRange } from '../../../../tools/arrays';
import { isObject } from '../../../../tools/objects';

import { EntryStatusUnion, Structure, EventTypeUnion, MatchUp } from '../../../../types/tournamentTypes';
import { STRUCTURE_SELECTED_STATUSES } from '../../../../constants/entryStatusConstants';
import { ResultType, decorateResult } from '../../../../global/functions/decorateResult';
import { AD_HOC, stageOrder } from '../../../../constants/drawDefinitionConstants';
import { DrawMaticArgs, ScaleAttributes } from '../../../../types/factoryTypes';
import { DYNAMIC, RATING } from '../../../../constants/scaleConstants';
import { SINGLES_EVENT } from '../../../../constants/eventConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  INVALID_DRAW_DEFINITION,
  INVALID_PARTICIPANT_ID,
  INVALID_VALUES,
  STRUCTURE_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

export function drawMatic(
  params: DrawMaticArgs,
): ResultType & { matchUps?: MatchUp[]; roundResults?: DrawMaticRoundResult[] } {
  const { tournamentRecord, idPrefix, salted, event } = params;

  const paramsCheck = checkParams(params);
  if (paramsCheck?.error) return paramsCheck;

  const idsResult = getParticipantIds(params);
  if (idsResult.error) return idsResult;

  const structureResult = getStructure(params);
  if (structureResult.error) return structureResult;

  const { adHocRatings } = getAdHocRatings(params);

  // TODO: update dynamic ratings based on matchUps present from last played round
  // use scaleEngine.generateDynamicRatings(); see dynamicCalculations.test.ts

  const isMock = tournamentRecord?.isMock ?? params.isMock;
  const eventType = params.eventType ?? event?.eventType;
  const matchUps: MatchUp[] = [];
  const roundResults: any = [];
  let roundNumber;

  for (const iteration of generateRange(1, (params.roundsCount ?? 1) + 1)) {
    const result = generateDrawMaticRound({
      ...params,
      participantIds: idsResult.participantIds,
      structure: structureResult.structure,
      ignoreLastRoundNumber: true,
      iterationMatchUps: matchUps,
      adHocRatings,
      roundNumber,
      eventType,
      idPrefix,
      salted,
      isMock,
      event,
    });
    if (result.error) return result;

    const { matchUps: roundMatchUps, ...roundResult } = result;
    roundResults.push({ ...roundResult, iteration, matchUpsCount: roundMatchUps?.length });
    roundNumber = (roundResult?.roundNumber ?? 1) + 1;
    if (roundMatchUps?.length) {
      matchUps.push(...roundMatchUps);
    }
  }

  return { ...SUCCESS, matchUps, roundResults };
}

type GetScaleValueArgs = {
  scaleAccessor?: string;
  eventType?: EventTypeUnion;
  scaleType?: string;
  scaleName: string;
  participant: any;
};

function getScaleValue({ scaleType = RATING, scaleAccessor, participant, scaleName, eventType }: GetScaleValueArgs) {
  const scaleAttributes: ScaleAttributes = {
    eventType: eventType ?? SINGLES_EVENT,
    scaleType,
    scaleName,
  };
  const result =
    participant &&
    participantScaleItem({
      scaleAttributes,
      participant,
    });

  const scaleValue = result?.scaleItem?.scaleValue;
  return scaleAccessor && isObject(scaleValue) ? scaleValue[scaleAccessor] : scaleValue;
}

function getAdHocRatings(params) {
  const { tournamentRecord, participantIds, scaleAccessor, scaleName, eventType, adHocRatings = {} } = params;

  const tournamentParticipants = tournamentRecord.participants ?? [];
  for (const participantId of participantIds ?? []) {
    const participant = tournamentParticipants?.find((participant) => participant.participantId === participantId);
    // first see if there is already a dynamic value
    let scaleValue = getScaleValue({
      scaleName: `${scaleName}.${DYNAMIC}`,
      scaleAccessor,
      participant,
      eventType,
    });
    // if no dynamic value found and a seeding scaleValue is provided...
    if (!scaleValue && scaleName) {
      scaleValue = getScaleValue({
        scaleAccessor,
        participant,
        scaleName,
        eventType,
      });
    }

    if (scaleValue && !adHocRatings[participantId]) adHocRatings[participantId] = scaleValue;
  }

  return { adHocRatings };
}

function getStructure(params): ResultType & { structure?: Structure } {
  if (params.structureId) return params.structureId;

  const drawDefinition = params.drawDefinition;
  // if no structureId is specified find the latest AD_HOC stage which has matchUps
  const targetStructure = drawDefinition?.structures
    ?.filter((structure) => structure.stageSequence === 1)
    ?.reduce((targetStructure: any, structure: any) => {
      const orderNumber = structure.stage && stageOrder[structure.stage];
      const structureIsAdHoc = isAdHoc({ drawDefinition, structure });

      return structureIsAdHoc && orderNumber > (stageOrder[targetStructure?.stage] || 1) ? structure : targetStructure;
    }, undefined);

  const structure = drawDefinition?.structures?.find(
    (structure) => structure.structureId === targetStructure?.structureId,
  );
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  // an AD_HOC structure is one that has no child structures and in which no matchUps have roundPosition
  const structureIsAdHoc = isAdHoc({ drawDefinition, structure });
  if (!structureIsAdHoc) return { error: INVALID_DRAW_DEFINITION };

  return { structure };
}

function getParticipantIds(params): ResultType & { participantIds?: string[] } {
  let { participantIds } = params;
  const enteredParticipantIds =
    params.drawDefinition?.entries
      ?.filter((entry) => {
        const entryStatus = entry.entryStatus as EntryStatusUnion;
        return !params.restrictEntryStatus || STRUCTURE_SELECTED_STATUSES.includes(entryStatus);
      })
      .map(getParticipantId) ?? [];

  if (participantIds) {
    // ensure all participantIds are in drawDefinition.entries
    const invalidParticipantIds = participantIds.filter(
      (participantId) => !enteredParticipantIds?.includes(participantId),
    );

    if (invalidParticipantIds?.length)
      return decorateResult({
        result: { error: INVALID_PARTICIPANT_ID },
        info: { invalidParticipantIds },
      });
  } else {
    participantIds = enteredParticipantIds;
  }

  if (
    params.roundsCount &&
    params.roundsCount > participantIds.length - 1 &&
    (!params.enableDoubleRobin || params.roundsCount > (participantIds.length - 1) * 2)
  ) {
    return { error: INVALID_VALUES, info: 'Not enough participants for roundsCount' };
  }

  return { participantIds };
}

function checkParams(params) {
  if (params.roundsCount && typeof params.roundsCount !== 'number') {
    return { error: INVALID_VALUES, info: 'roundsCount must be a number' };
  }

  if (
    typeof params.drawDefinition !== 'object' ||
    (params.drawDefinition.drawType && params.drawDefinition.drawType !== AD_HOC)
  ) {
    return { error: INVALID_DRAW_DEFINITION };
  }

  if (
    !Array.isArray(params.drawDefinition?.entries) &&
    params.participantIds &&
    !Array.isArray(params.participantIds)
  ) {
    return { error: INVALID_VALUES, info: 'Missing Entries' };
  }
}
