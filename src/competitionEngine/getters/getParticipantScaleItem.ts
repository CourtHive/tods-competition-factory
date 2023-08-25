import { participantScaleItem } from '../../tournamentEngine/accessors/participantScaleItem';
import { publicFindParticipant } from './participantGetter';

import { SUCCESS } from '../../constants/resultConstants';

export function getParticipantScaleItem({
  policyDefinitions,
  tournamentRecords,
  scaleAttributes,
  participantId,
  inContext,
  personId,
}) {
  let result: any = publicFindParticipant({
    policyDefinitions,
    tournamentRecords,
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
