module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Competition Factory',
      items: ['introduction', 'tmx', 'installation', 'migration'],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/actions',
        'concepts/accessors',
        'concepts/context',
        'concepts/draw-generation',
        {
          Policies: [
            'concepts/policies',
            {
              Avoidance: ['policies/avoidance', 'policies/accessors'],
            },
            'policies/positionActions',
            'policies/matchUpActions',
            'policies/participantPolicy',
            'policies/positioningSeeds',
            'policies/scheduling',
            'policies/rankingPolicy',
            'policies/roundNaming',
            'policies/tallyPolicy',
            'policies/feedPolicy',
          ],
        },
        'concepts/publishing',
        'concepts/scheduling',
        'concepts/scaleItems',
        'concepts/timeItems',
        'concepts/subscriptions',
      ],
    },
    {
      type: 'category',
      label: 'State Engines',
      items: [
        {
          type: 'doc',
          label: 'Overview',
          id: 'engines/state-engines',
        },
        'engines/engine-logging',
        'engines/engine-middleware',
        'engines/mutation-engines',
        'engines/custom-engines',
      ],
    },
    {
      type: 'category',
      label: 'Governors',
      items: [
        {
          type: 'doc',
          label: 'Overview',
          id: 'governors/governors-overview',
        },
        'governors/competition-governor',
        'governors/draws-governor',
        'governors/entries-governor',
        'governors/event-governor',
        'governors/generation-governor',
        'governors/matchup-governor',
        'governors/matchup-format-governor',
        'governors/mocks-governor',
        'governors/participant-governor',
        'governors/policy-governor',
        'governors/publishing-governor',
        'governors/query-governor',
        'governors/report-governor',
        'governors/schedule-governor',
        'governors/score-governor',
        'governors/tournament-governor',
        'governors/venue-governor',
      ],
    },
    {
      type: 'category',
      label: 'Data',
      items: [
        'constants',
        {
          Codes: ['codes/age-category', 'codes/matchup-format'],
        },
        'types/typedefs',
        'concepts/extensions',
        {
          Explanation: ['concepts/lineUp', 'concepts/tieFormat', 'concepts/tieMatchUp'],
        },
      ],
    },
    {
      type: 'category',
      label: 'Utilities',
      items: [
        {
          type: 'doc',
          label: 'Overview',
          id: 'utilities/utilities-overview',
        },
        'utilities/make-deep-copy',
        'utilities/structure-sort',
        'utilities/json-to-csv',
        { type: 'doc', label: 'API', id: 'utilities/utilities-api' },
      ],
    },
  ],
};
