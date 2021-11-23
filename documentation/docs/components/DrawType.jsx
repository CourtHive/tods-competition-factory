import {
  tournamentEngine,
  mocksEngine,
  utilities,
} from 'tods-competition-factory';
import { ScoreGrid } from 'tods-score-grid';
import React from 'react';

const DrawType = ({ drawType, drawSize = 8 }) => {
  const drawProfile = {
    seedsCount: 4,
    drawType,
    drawSize,
  };
  if (drawType === 'AD_HOC')
    Object.assign(drawProfile, { drawMatic: true, roundsCount: 3 });

  const result = mocksEngine.generateTournamentRecord({
    drawProfiles: [drawProfile],
    completeAllMatchUps: true,
    randomWinningSide: true,
  });

  const { tournamentRecord, eventIds } = result || {};
  const eventId = eventIds?.[0];

  const { eventData } =
    tournamentEngine.setState(tournamentRecord).getEventData({ eventId }) || {};

  const compositionName = utilities.randomMember([
    'Australian',
    'Wimbledon',
    'National',
    'US Open',
    'French',
    'ITF',
  ]);

  return (
    <div style={{ zoom: 0.9 }}>
      <ScoreGrid
        compositionName={compositionName}
        eventData={eventData}
        events={{}}
      />
    </div>
  );
};

export default DrawType;
