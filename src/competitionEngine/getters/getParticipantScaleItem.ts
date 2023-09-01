import { participantScaleItem } from '../../tournamentEngine/accessors/participantScaleItem';
import { publicFindParticipant } from './participantGetter';

import { SUCCESS } from '../../constants/resultConstants';
import { Tournament } from '../../types/tournamentFromSchema';
import { ScaleAttributes, ScaleItem } from '../../types/factoryTypes';
import { ResultType } from '../../global/functions/decorateResult';

type GetParticipantScaleItemArgs = {
  tournamentRecords: { [key: string]: Tournament };
  scaleAttributes: ScaleAttributes;
  policyDefinitions?: any;
  participantId?: string;
  inContext?: boolean;
  personId?: string;
};
export function getParticipantScaleItem({
  tournamentRecords,
  policyDefinitions,
  scaleAttributes,
  participantId,
  inContext,
  personId,
}: GetParticipantScaleItemArgs): ResultType & {
  scaleItem?: ScaleItem;
} {
  let result: any = publicFindParticipant({
    tournamentRecords,
    policyDefinitions,
    participantId,
    inContext,
    personId,
  });
  if (result.error) return result;

  const { participant, tournamentId } = result;

  result = participantScaleItem({ participant, scaleAttributes });
  if (result.error) return { ...result, tournamentId };

  return { ...SUCCESS, tournamentId, ...result };
}
