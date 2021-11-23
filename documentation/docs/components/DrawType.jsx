import { tournamentEngine, mocksEngine } from 'tods-competition-factory';
import { ScoreGrid } from 'tods-score-grid';
import React from 'react';

const DrawType = ({ drawType }) => {
  const drawProfile = {
    drawSize: 16,
    // drawType,
    // completionGoal: complete,
    seedsCount: 8,
    // matchUpFormat,
    // eventType,
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

  return (
    <ScoreGrid
      compositionName={'Australian'}
      eventData={eventData}
      events={{}}
    />
  );
};

export default DrawType;
