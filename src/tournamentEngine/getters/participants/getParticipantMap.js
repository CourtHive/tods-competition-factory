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
  withIndividualParticipants,
  convertExtensions,
  policyDefinitions,
  tournamentRecord,
  withSignInStatus,
  withScaleValues,
  internalUse,
  // inContext, - may be deprecated in favor of `withIndividualParticipants`
  withISO2,
  withIOC,
}) {
  const typeMap = {
    [GROUP]: 'groupParticipantIds',
    [PAIR]: 'pairParticipantIds',
    [TEAM]: 'teamParticipantIds',
  };
  const membershipMap = {
    [GROUP]: 'groups',
    [TEAM]: 'teams',
  };

  const signedIn = (participant) => {
    const { timeItem } = getTimeItem({
      itemType: SIGN_IN_STATUS,
      element: participant,
    });

    return timeItem?.itemValue !== SIGNED_IN;
  };
  const participantAttributes = policyDefinitions?.[POLICY_TYPE_PARTICIPANT];
  const filterAttributes = participantAttributes?.participant;

  const initializeParticipantId = (participantId) => {
    participantMap[participantId] = {
      potentialMatchUps: {},
      scheduleItems: [],
      participant: {
        groupParticipantIds: [],
        pairParticipantIds: [],
        teamParticipantIds: [],
        groups: [],
        teams: [],
      },
      opponents: {},
      pairIdMap: {},
      matchUps: {},
      events: {},
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

    Object.assign(
      participantMap[participantId].participant,
      filteredParticipant
    );

    if (individualParticipantIds) {
      for (const individualParticipantId of individualParticipantIds) {
        if (!participantMap[individualParticipantId]) {
          initializeParticipantId(individualParticipantId);
        }
        participantMap[individualParticipantId].participant[
          typeMap[participantType]
        ].push(participantId);

        if ([TEAM, GROUP].includes(participantType)) {
          const {
            participantRoleResponsibilities,
            participantOtherName,
            participantName,
            participantId,
            teamId,
          } = filteredParticipant;
          participantMap[individualParticipantId].participant[
            membershipMap[participantType]
          ].push({
            participantRoleResponsibilities,
            participantOtherName,
            participantName,
            participantId,
            teamId,
          });
        }

        if (participantType === PAIR) {
          const partnerParticipantId = individualParticipantIds.find(
            (id) => id !== individualParticipantId
          );
          participantMap[individualParticipantId].pairIdMap[participantId] =
            partnerParticipantId;
          participantMap[individualParticipantId].pairIdMap[
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

  if (withIndividualParticipants) {
    for (const { participant } of Object.values(participantMap)) {
      if (participant.individualParticipantIds?.length) {
        participant.individualParticipants = [];
        for (const participantId of participant.individualParticipantIds) {
          participant.individualParticipants.push(
            participantMap[participantId]
          );
        }
      }
    }
  }

  return { participantMap };
}
