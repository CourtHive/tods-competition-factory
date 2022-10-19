import { addNationalityCode } from '../../governors/participantGovernor/addNationalityCode';
import { getTimeItem } from '../../governors/queryGovernor/timeItems';
import { attributeFilter, makeDeepCopy } from '../../../utilities';
import { getScaleValues } from './getScaleValues';

import { POLICY_TYPE_PARTICIPANT } from '../../../constants/policyConstants';
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
  convertExtensions,
  policyDefinitions,
  tournamentRecord,
  withSignInStatus,
  withScaleValues,
  internalUse,
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
  const participantAttributes = policyDefinitions?.[POLICY_TYPE_PARTICIPANT];
  const filterAttributes = participantAttributes?.participant;

  const initializeParticipantId = (participantId) => {
    participantMap[participantId] = {
      [typeMap[GROUP]]: [],
      [typeMap[TEAM]]: [],
      [typeMap[PAIR]]: [],
      potentialMatchUps: {},
      scheduleItems: [],
      opponents: {},
      pairIdMap: {},
      matchUps: {},
      events: {},
      groups: [],
      teams: [],
      draws: {},
      losses: 0,
      wins: 0,
    };
  };

  const participantMap = {};
  for (const participant of tournamentRecord.participants || []) {
    const participantCopy = makeDeepCopy(
      participant,
      convertExtensions,
      internalUse
    );
    const filteredParticipant = filterAttributes
      ? attributeFilter({
          template: participantAttributes.participant,
          source: participantCopy,
        })
      : participantCopy;

    const { participantId, individualParticipantIds, participantType } =
      filteredParticipant;

    initializeParticipantId(participantId);

    participantMap[participantId].participant = filteredParticipant;

    if (individualParticipantIds) {
      for (const individualParticiapntId of individualParticipantIds) {
        if (!participantMap[individualParticiapntId]) {
          initializeParticipantId(individualParticiapntId);
        }
        participantMap[individualParticiapntId][typeMap[participantType]].push(
          participantId
        );

        if (participantType === PAIR) {
          const partnerParticipantId = individualParticipantIds.find(
            (id) => id !== individualParticiapntId
          );
          participantMap[individualParticiapntId].pairIdMap[participantId] =
            partnerParticipantId;
          participantMap[individualParticiapntId].pairIdMap[
            partnerParticipantId
          ] = participantId;
        }
      }
    }

    if (withSignInStatus) {
      participantMap[participantId].participant.signedIn =
        signedIn(participantCopy);
    }

    if (withScaleValues) {
      const { ratings, rankings } = getScaleValues({
        participant: participantCopy,
      });
      participantMap[participantId].participant.ratings = ratings;
      participantMap[participantId].participant.rankings = rankings;
    }

    if (withIOC || withISO2)
      addNationalityCode({
        participant: participantMap[participantId].participant,
        withISO2,
        withIOC,
      });
  }

  return { participantMap };
}
