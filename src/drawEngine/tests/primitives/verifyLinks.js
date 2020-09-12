import { drawEngine } from '../../../drawEngine';

export function verifyLinks({ linksProfiles = [] }) {
  const { drawDefinition } = drawEngine.getState();
  const { links } = { ...drawDefinition };

  linksProfiles.forEach(linksProfile => {
    const { sourceStructureId, targetStructureId } = { ...linksProfile };
    let { linkProfiles } = { ...linksProfile };
    linkProfiles = linkProfiles.sort(
      (a, b) => a.linkedRounds[0] - b.linkedRounds[0]
    );

    const filteredLinks = links
      .filter(link => {
        return (
          link.source.structureId === sourceStructureId &&
          link.target.structureId === targetStructureId
        );
      })
      .sort((a, b) => a.source.roundNumber - b.source.roundNumber);

    expect(linkProfiles.length).toEqual(filteredLinks.length);

    linkProfiles.forEach((linkProfile, i) => {
      const filteredLink = filteredLinks[i];
      const linkedRounds = [
        filteredLink.source.roundNumber,
        filteredLink.target.roundNumber,
      ];
      expect(linkProfile.linkedRounds).toMatchObject(linkedRounds);
      expect(linkProfile.feedProfile).toEqual(filteredLink.target.feedProfile);
      expect(linkProfile.linkSubject).toEqual(filteredLink.linkSubject);
    });
  });
}
