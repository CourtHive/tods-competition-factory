module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Competition Factory',
      items: ['overview', 'installation'],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/subscriptions',
        {
          Policies: ['concepts/policies', 'policies/feedPolicy'],
        },
        'concepts/timeItems',
        'concepts/scaleItems',
      ],
    },
    {
      type: 'category',
      label: 'Competition Engine',
      items: ['apis/competition-engine-api'],
    },
    {
      type: 'category',
      label: 'Tournament Engine',
      items: ['apis/tournament-engine-api'],
    },
  ],
};
