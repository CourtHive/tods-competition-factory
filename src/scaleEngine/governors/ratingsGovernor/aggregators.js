export const aggregateGames = (sets) => {
  return (
    sets?.reduce(
      (aggregate, set) => {
        aggregate[0] += set.side1Score;
        aggregate[1] += set.side2Score;
        return aggregate;
      },
      [0, 0]
    ) || [0, 0]
  );
};

export const aggregateSets = (sets) => {
  return (
    sets?.reduce(
      (aggregate, set) => {
        if (set.winningSide) aggregate[set.winningSide - 1] += 1;
        return aggregate;
      },
      [0, 0]
    ) || [0, 0]
  );
};
