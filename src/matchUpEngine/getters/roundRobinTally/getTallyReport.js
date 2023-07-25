export function getTallyReport({ matchUps, order, report }) {
  const participants = {};

  matchUps.forEach(({ sides }) => {
    sides.forEach((side) => {
      if (side.participantId && side.participant) {
        participants[side.participantId] = side.participant.participantName;
      }
    });
  });

  const readable = [];

  if (Array.isArray(report)) {
    report.forEach((step, i) => {
      if (step.excludedDirectives?.length) {
        const attributes = step.excludedDirectives
          .map(({ attribute }) => attribute)
          .join(', ');
        const note = `${attributes.length} directives were excluded due to participants limit}`;
        readable.push(note);
        const excluded = `Excluded: ${attributes}`;
        readable.push(excluded);
      } else {
        const floatSort = (a, b) =>
          parseFloat(step.reversed ? a : b) - parseFloat(step.reversed ? b : a);
        const getExplanation = (step) => {
          Object.keys(step.groups)
            .sort(floatSort)
            .forEach((key) => {
              const participantNames = step.groups[key]
                .map((participantId) => participants[participantId])
                .join(', ');
              const explanation = `${key} ${step.attribute}: ${participantNames}`;
              readable.push(explanation);
            });
        };

        const reversed = step.reversed ? ' in reverse order' : '';
        const participantsCount = Object.values(step.groups).flat(
          Infinity
        ).length;
        const description = `Step ${
          i + 1
        }: ${participantsCount} particiants were grouped${reversed} by ${
          step.attribute
        }`;
        readable.push(description);
        if (step.idsFilter) {
          const note = `${step.attribute} was calculated considering ONLY TIED PARTICIPANTS`;
          readable.push(note);
        }
        getExplanation(step);
      }
      readable.push('----------------------');
    });
  }

  readable.push('Final Order:');
  order.forEach((orderEntry) => {
    const { participantId, resolved } = orderEntry;
    const pOrder = orderEntry.groupOrder || orderEntry.provisionalOrder;
    readable.push(
      `${pOrder}: ${participants[participantId]} => resolved: ${resolved}`
    );
  });

  return readable.join('\r\n');
}
