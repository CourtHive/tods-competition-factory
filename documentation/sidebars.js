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
        {
          Participants: ['concepts/participants', 'concepts/participant-context', 'concepts/scaleItems'],
        },
        {
          Policies: [
            'concepts/policies',
            'policies/tallyPolicy',
            'policies/avoidance',
            'policies/positionActions',
            'policies/matchUpActions',
            'policies/roundNaming',
            'policies/participantPolicy',
            'policies/positioningSeeds',
            'policies/scheduling',
            'policies/scoringPolicy',
            'policies/draws',
            'policies/feedPolicy',
            // 'policies/rankingPolicy',
            'policies/progressionPolicy',
            'policies/consolationPolicy',
            'policies/competitiveBands',
          ],
        },
        {
          matchUps: [
            'concepts/matchup-overview',
            'concepts/matchup-context',
            'concepts/matchup-filtering',
            'concepts/tieMatchUp',
            'concepts/lineUp',
            'concepts/tieFormat',
          ],
        },
        {
          Draws: ['concepts/draws-overview', 'concepts/draw-types', 'concepts/actions'],
        },
        {
          Scheduling: [
            'concepts/scheduling-overview',
            'concepts/venues-courts',
            'concepts/scheduling-policy',
            'concepts/scheduling-profile',
            'concepts/automated-scheduling',
            'concepts/pro-scheduling',
            'concepts/scheduling-conflicts',
          ],
        },
        'concepts/publishing',
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
        'engines/engine-methods',
        'engines/engine-logging',
        'engines/engine-middleware',
        'engines/mutation-engines',
        'engines/subscriptions',
        'engines/custom-engines',
        'engines/global-state',
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
      label: 'Tools',
      items: [
        {
          type: 'doc',
          label: 'Overview',
          id: 'tools/tools-overview',
        },
        'tools/make-deep-copy',
        'tools/structure-sort',
        'tools/json-to-csv',
      ],
    },
    {
      Testing: [
        { type: 'doc', label: 'Overview', id: 'testing/testing-overview' },
        'testing/mocks-engine',
        'testing/factory-server',
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
        'concepts/accessors',
        'concepts/timeItems',
        'concepts/extensions',
      ],
    },
  ],
};
