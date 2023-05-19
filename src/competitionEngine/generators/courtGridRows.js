import { generateRange } from '../../utilities';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';

export function courtGridRows({
  courtPrefix = 'C|',
  minRowsCount,
  courtsData,
}) {
  if (!Array.isArray(courtsData)) return { error: INVALID_VALUES };
  const maxCourtOrder = courtsData?.reduce((order, court) => {
    const matchUps = court.matchUps || [];
    const courtOrder = Math.max(
      0,
      ...matchUps.map((m) => m.schedule.courtOrder || 0)
    );
    return courtOrder > order ? courtOrder : order;
  }, 1);

  const rowsCount = minRowsCount
    ? Math.max(minRowsCount, maxCourtOrder)
    : maxCourtOrder;

  const rowBuilder = generateRange(0, rowsCount).map((rowIndex) => ({
    matchUps: generateRange(0, courtsData.length).map((courtIndex) => {
      const courtInfo = courtsData[courtIndex];
      const { courtId, venueId } = courtInfo;
      return {
        schedule: {
          courtOrder: rowIndex + 1,
          venueId,
          courtId,
        },
      };
    }),
  }));

  courtsData.forEach((courtInfo, i) => {
    for (const matchUp of courtInfo.matchUps) {
      const courtOrder = matchUp.schedule?.courtOrder;
      if (courtOrder) {
        rowBuilder[courtOrder - 1].matchUps[i] = matchUp;
      }
    }
  });

  return {
    courtPrefix,
    rows: rowBuilder.map((row, i) =>
      Object.assign(
        { rowId: `rowId-${i + 1}` },
        ...row.matchUps.map((matchUp, i) => ({
          [`${courtPrefix}${i}`]: matchUp,
        }))
      )
    ),
  };
}
