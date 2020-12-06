export function deletionMessage({ matchUpsCount = 0 }) {
  const singularPlural = matchUpsCount === 1 ? 'matchUp' : 'matchUps';
  return {
    message: `Schedule would be deleted from ${matchUpsCount} ${singularPlural}; use { force: true }`,
  };
}
