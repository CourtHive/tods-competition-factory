import { participantScaleItem } from '../../query/participant/participantScaleItem';
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
  personId?: string;
};
export function getParticipantScaleItem({
  tournamentRecords,
  policyDefinitions,
  scaleAttributes,
  participantId,
  personId,
}: GetParticipantScaleItemArgs): ResultType & {
  scaleItem?: ScaleItem;
} {
  let result: any = publicFindParticipant({
    tournamentRecords,
    policyDefinitions,
    participantId,
    personId,
  });
  if (result.error) return result;

  const { participant, tournamentId } = result;

  result = participantScaleItem({ participant, scaleAttributes });
  if (result.error) return { ...result, tournamentId };

  return { ...SUCCESS, tournamentId, ...result };
}
