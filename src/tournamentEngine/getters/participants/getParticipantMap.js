import { addNationalityCode } from '../../governors/participantGovernor/addNationalityCode';
import { getTimeItem } from '../../governors/queryGovernor/timeItems';
import { makeDeepCopy } from '../../../utilities';
import { getScaleValues } from './getScaleValues';

import {
  GROUP,
  PAIR,
  SIGNED_IN,
  SIGN_IN_STATUS,
  TEAM,
} from '../../../constants/participantConstants';

// build up an object with participantId keys which map to deepCopied participants
// and which include all relevant groupings for each individualParticipant
export function getParticipantMap({
  tournamentRecord,
  convertExtensions,
  withSignInStatus,
  withScaleValues,
  withISO2,
  withIOC,
}) {
  const typeMap = {
    [GROUP]: 'groupParticipantIds',
    [PAIR]: 'pairParticipantIds',
    [TEAM]: 'teamParticipantIds',
  };

  const signedIn = (participant) => {
    const { timeItem } = getTimeItem({
      itemType: SIGN_IN_STATUS,
      element: participant,
    });

    return !!(timeItem?.itemValue === SIGNED_IN);
  };

  const participantMap = {};
  for (const participant of tournamentRecord.participants || []) {
    const participantCopy = makeDeepCopy(participant, convertExtensions, true);
    const { participantId, individualParticipantIds, participantType } =
      participantCopy;
    if (!participantMap[participantId]) {
      participantMap[participantId] = { participant: participantCopy };
    } else {
      participantMap[participantId].participant = participantCopy;
    }

    if (individualParticipantIds) {
      for (const individualParticiapntId of individualParticipantIds) {
        if (!participantMap[individualParticiapntId]) {
          participantMap[individualParticiapntId] = {};
        }
        if (
          !participantMap[individualParticiapntId][typeMap[participantType]]
        ) {
          participantMap[individualParticiapntId][typeMap[participantType]] =
            [];
        }
        participantMap[individualParticiapntId][typeMap[participantType]].push(
          participantId
        );
      }
    }

    if (withSignInStatus) {
      participantMap[participantId].signedIn = signedIn(participantCopy);
    }

    if (withScaleValues) {
      const { ratings, rankings } = getScaleValues({
        participant: participantCopy,
      });
      participantMap[participantId].ratings = ratings;
      participantMap[participantId].rankings = rankings;
    }

    if (withIOC || withISO2)
      addNationalityCode({
        participant: participantCopy,
        withISO2,
        withIOC,
      });
  }

  return { participantMap };
}
