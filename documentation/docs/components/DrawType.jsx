import { compositions, renderStructure } from 'courthive-components';

import {
  tournamentEngine,
  mocksEngine,
  utilities,
} from 'tods-competition-factory';
import React from 'react';

const DrawType = ({ drawType, drawSize = 8 }) => {
  const drawProfile = {
    seedsCount: 4,
    drawType,
    drawSize,
  };
  if (drawType === 'AD_HOC')
    Object.assign(drawProfile, { automated: true, roundsCount: 3 });

  const result = mocksEngine.generateTournamentRecord({
    drawProfiles: [drawProfile],
    completeAllMatchUps: true,
    randomWinningSide: true,
  });

  const { tournamentRecord, eventIds } = result || {};
  const eventId = eventIds?.[0];

  const { eventData } =
    tournamentEngine.setState(tournamentRecord).getEventData({
      participantsProfile: { withIOC: true, withISO2: true },
      eventId,
    }) || {};

  const structures = eventData?.drawsData?.[0]?.structures || [];
  const initialStructureId = structures[0]?.structureId;
  const structure = structures?.find(
    (structure) => structure.structureId === initialStructureId
  );
  const roundMatchUps = structure?.roundMatchUps;
  const matchUps = roundMatchUps ? Object.values(roundMatchUps)?.flat() : [];

  const compositionName = utilities.randomMember([
    'Australian',
    'Wimbledon',
    'National',
    'US Open',
    'French',
    'ITF',
  ]);

  const newNode = renderStructure({
    composition: compositions[compositionName],
    matchUps,
  });

  return (
    <div style={{ zoom: 0.9 }}>
      <div
        ref={(nodeElement) => {
          while (nodeElement?.firstChild) {
            nodeElement.removeChild(nodeElement.firstChild);
          }
          nodeElement && nodeElement.appendChild(newNode);
        }}
      />
    </div>
  );
};

export default DrawType;
