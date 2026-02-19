import { tournamentEngine, mocksEngine } from 'tods-competition-factory';
import React, { useEffect, useState, useRef } from 'react';

const BurstChart = ({ drawSize = 32, seedsCount = 8 }) => {
  const [courthiveComponents, setCourthiveComponents] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    import('courthive-components').then((module) => {
      setCourthiveComponents(module);
    });
  }, []);

  useEffect(() => {
    if (!courthiveComponents || !containerRef.current) return;

    const { burstChart, fromFactoryDrawData } = courthiveComponents;

    const drawProfile = { seedsCount, drawSize, drawType: 'SINGLE_ELIMINATION' };

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

    const structure = eventData?.drawsData?.[0]?.structures?.[0];
    if (!structure) return;

    const sunburstData = fromFactoryDrawData(structure);
    const title = tournamentRecord?.tournamentName || 'Tournament Draw';

    const chart = burstChart({ colorBySeeds: true });

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    chart.render(containerRef.current, sunburstData, title);
  }, [courthiveComponents, drawSize, seedsCount]);

  if (!courthiveComponents) {
    return <div>Loading...</div>;
  }

  return <div ref={containerRef} />;
};

export default BurstChart;
