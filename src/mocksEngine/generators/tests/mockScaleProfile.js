export const mockProfile = {
  drawProfiles: [
    {
      drawSize: 8,
      generate: false,
      eventName: 'U18 Singles',
      category: {
        ageCategoryCode: 'U18',
      },
      eventAttributes: {
        timeItems: [
          {
            itemType: 'RETRIEVAL.RANKING.SINGLES.U18',
            itemValue: '2021-10-30T18:18:46.928Z',
            createdAt: '2021-10-30T18:18:46.928Z',
          },
        ],
      },
    },
    {
      drawSize: 8,
      generate: false,
      eventName: 'WTN Singles',
      category: {
        ageCategoryCode: 'OPEN',
        ratingType: 'WTN',
      },
      eventAttributes: {
        timeItems: [
          {
            itemType: 'RETRIEVAL.RATING.SINGLES.WTN',
            itemValue: '2021-10-30T18:18:46.928Z',
            createdAt: '2021-10-30T18:18:46.928Z',
          },
        ],
      },
    },
    {
      drawSize: 8,
      generate: false,
      eventName: 'NTRP Singles',
      category: {
        ageCategoryCode: 'OPEN',
        ratingType: 'NTRP',
        ratingAttributes: { decimalsCount: 1, step: 0.5 },
      },
      eventAttributes: {
        timeItems: [
          {
            itemType: 'RETRIEVAL.RATING.SINGLES.NTRP',
            itemValue: '2021-10-30T18:18:46.928Z',
            createdAt: '2021-10-30T18:18:46.928Z',
          },
        ],
      },
      eventExtensions: [
        {
          name: 'division',
          value: { ratingCategory: { value: 5 } },
        },
      ],
    },
  ],
  tournamentName: 'Rankings and Ratings',
};
