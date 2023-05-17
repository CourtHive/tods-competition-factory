import { generateRange } from '../../utilities';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';

export function courtGridRows({ courtsData, courtPrefix = 'C|' }) {
  if (!Array.isArray(courtsData)) return { error: INVALID_VALUES };
  const maxCourtOrder = courtsData?.reduce((order, court) => {
    const matchUps = court.matchUps || [];
    const courtOrder = Math.max(
      0,
      ...matchUps.map((m) => m.schedule.courtOrder || 0)
    );
    return courtOrder > order ? courtOrder : order;
  }, 1);

  const rowBuilder = generateRange(0, maxCourtOrder).map((i) => ({
    rownumber: i + 1,
    matchUps: [],
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
    rows: rowBuilder.map((row) =>
      Object.assign(
        {},
        ...row.matchUps.map((matchUp, i) => ({
          [`${courtPrefix}${i}`]: matchUp,
        }))
      )
    ),
  };
}
