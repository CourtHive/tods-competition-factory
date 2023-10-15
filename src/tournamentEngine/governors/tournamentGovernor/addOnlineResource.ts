import { ResultType } from '../../../global/functions/decorateResult';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import {
  OnlineResource,
  Tournament,
} from '../../../types/tournamentFromSchema';

type AddOnlineResourceArgs = {
  tournamentRecord: Tournament;
  onlineResource: OnlineResource;
};

// TODO: ability to add onlineResources to other items, e.g. organisations, participants, persons, venues, courts

export function addOnlineResource({
  tournamentRecord,
  onlineResource,
}: AddOnlineResourceArgs): ResultType {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!onlineResource) return { error: MISSING_VALUE };

  if (!tournamentRecord.onlineResources) tournamentRecord.onlineResources = [];

  // TODO: onlineResource validation
  tournamentRecord.onlineResources.push(onlineResource);

  return { ...SUCCESS };
  /**
[
  {
    identifier:
    resourceSubType: 'IMAGE',
    name: 'tournamentImage',
    resourceType: 'URL',
  },
];
*/
}
