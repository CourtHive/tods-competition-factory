import { participantScaleItem } from '../../tournamentEngine/accessors/participantScaleItem';
import { publicFindParticipant } from './participantGetter';

import { ResultType } from '../../global/functions/decorateResult';
import { SUCCESS } from '../../constants/resultConstants';
import {
  PolicyDefinitions,
  ScaleAttributes,
  ScaleItem,
  TournamentRecords,
} from '../../types/factoryTypes';

type GetParticipantScaleItemArgs = {
  tournamentRecords: TournamentRecords;
  policyDefinitions?: PolicyDefinitions;
  scaleAttributes: ScaleAttributes;
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
