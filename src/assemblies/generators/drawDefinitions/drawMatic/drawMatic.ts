import { participantScaleItem } from '../../../../query/participant/participantScaleItem';
import { generateDrawMaticRound, DrawMaticRoundResult } from './generateDrawMaticRound';
import { getParticipantId } from '../../../../global/functions/extractors';
import { isAdHoc } from '../../../../query/drawDefinition/isAdHoc';
import { isObject } from '../../../../tools/objects';

import { STRUCTURE_SELECTED_STATUSES } from '../../../../constants/entryStatusConstants';
import { ResultType, decorateResult } from '../../../../global/functions/decorateResult';
import { AD_HOC, stageOrder } from '../../../../constants/drawDefinitionConstants';
import { DYNAMIC, RATING } from '../../../../constants/scaleConstants';
import { SINGLES_EVENT } from '../../../../constants/eventConstants';
import { ScaleAttributes } from '../../../../types/factoryTypes';
import {
  DrawDefinition,
  EntryStatusUnion,
  Event,
  Structure,
  Tournament,
  EventTypeUnion,
} from '../../../../types/tournamentTypes';
import {
  INVALID_DRAW_DEFINITION,
  INVALID_PARTICIPANT_ID,
  INVALID_VALUES,
  STRUCTURE_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

export type DrawMaticArgs = {
  adHocRatings?: { [key: string]: number };
  restrictEntryStatus?: boolean;
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  generateMatchUps?: boolean;
  eventType?: EventTypeUnion;
  salted?: number | boolean;
  participantIds?: string[];
  encounterValue?: number;
  sameTeamValue?: number;
  maxIterations?: number;
  structure?: Structure;
  matchUpIds?: string[];
  structureId?: string;
  idPrefix?: string;
  isMock?: boolean;
  event: Event;

  scaleAccessor?: string;
  scaleName?: string;
};

export function drawMatic(params: DrawMaticArgs): ResultType & DrawMaticRoundResult {
  const {
    restrictEntryStatus,
    adHocRatings = {},
    generateMatchUps,
    tournamentRecord,
    encounterValue,
    sameTeamValue,
    drawDefinition,
    scaleAccessor,
    maxIterations,
    matchUpIds,
    scaleName, // custom rating name to seed dynamic ratings
    idPrefix,
    salted,
    event,
  } = params;

  if (typeof drawDefinition !== 'object' || (drawDefinition.drawType && drawDefinition.drawType !== AD_HOC)) {
    return { error: INVALID_DRAW_DEFINITION };
  }

  let { participantIds, structureId } = params;
  const isMock = tournamentRecord?.isMock ?? params.isMock;

  if (!Array.isArray(drawDefinition?.entries) && participantIds && !Array.isArray(participantIds)) {
    return { error: INVALID_VALUES, info: 'Missing Entries' };
  }

  const eventType = params.eventType ?? event?.eventType;

  const enteredParticipantIds = drawDefinition?.entries
    ?.filter((entry) => {
      const entryStatus = entry.entryStatus as EntryStatusUnion;
      return !restrictEntryStatus || STRUCTURE_SELECTED_STATUSES.includes(entryStatus);
    })
    .map(getParticipantId);

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

  // if no structureId is specified find the latest AD_HOC stage which has matchUps
  if (!structureId) {
    const targetStructure = drawDefinition?.structures
      ?.filter((structure) => structure.stageSequence === 1)
      ?.reduce((targetStructure: any, structure: any) => {
        const orderNumber = structure.stage && stageOrder[structure.stage];
        const structureIsAdHoc = isAdHoc({ drawDefinition, structure });

        return structureIsAdHoc && orderNumber > (stageOrder[targetStructure?.stage] || 1)
          ? structure
          : targetStructure;
      }, undefined);
    structureId = targetStructure?.structureId;
  }

  const structure = drawDefinition?.structures?.find((structure) => structure.structureId === structureId);
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  // an AD_HOC structure is one that has no child structures and in which no matchUps have roundPosition
  const structureIsAdHoc = isAdHoc({ drawDefinition, structure });
  if (!structureIsAdHoc) return { error: INVALID_DRAW_DEFINITION };

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

  // TODO: update dynamic ratings based on matchUps present from last played round
  // use scaleEngine.generateDynamicRatings(); see dynamicCalculations.test.ts

  return generateDrawMaticRound({
    tournamentParticipants,
    generateMatchUps,
    participantIds,
    encounterValue,
    sameTeamValue,
    drawDefinition,
    maxIterations,
    adHocRatings,
    matchUpIds,
    structure,
    eventType,
    idPrefix,
    salted,
    isMock,
    event,
  });
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
