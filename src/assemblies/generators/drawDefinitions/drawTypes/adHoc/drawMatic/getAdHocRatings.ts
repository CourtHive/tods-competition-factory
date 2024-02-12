import { participantScaleItem } from '@Query/participant/participantScaleItem';
import ratingsParameters from '@Fixtures/ratings/ratingsParameters';
import { isObject } from '@Tools/objects';

// constants and types
import { DYNAMIC, RATING } from '@Constants/scaleConstants';
import { SINGLES_EVENT } from '@Constants/eventConstants';
import { EventTypeUnion } from '@Types/tournamentTypes';
import { ScaleAttributes } from '@Types/factoryTypes';

export function getAdHocRatings(params) {
  const { tournamentRecord, participantIds, scaleName, eventType, adHocRatings = {} } = params;

  const scaleAccessor = params.scaleAccessor ?? ratingsParameters[scaleName]?.accessor;

  const tournamentParticipants = tournamentRecord.participants ?? [];
  for (const participantId of participantIds ?? []) {
    const participant = tournamentParticipants?.find((participant) => participant.participantId === participantId);
    // first see if there is already a dynamic value
    let scaleValue = getScaleValue({
      scaleName: `${scaleName}.${DYNAMIC}`,
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

  return adHocRatings;
}

type GetScaleValueArgs = {
  eventType?: EventTypeUnion;
  scaleAccessor?: string;
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
