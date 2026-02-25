---
title: Seeding
---

Seeding publication is separate from draw publication, allowing flexible control over when seeding information becomes public.

## Why Separate Seeding Publication?

- **Competition Integrity**: Prevent participants from knowing their seeded positions before draws finalized
- **Draw Process**: Complete seeding internally before public announcement
- **Flexibility**: Update seeding without re-publishing entire draw
- **Staged Release**: Announce seeded players separately from draw structure

## Publishing Seeding

```js
engine.publishEventSeeding({
  eventId,
  seedingScaleNames: ['U18'], // Optional - specify which scales
  drawIds: ['drawId1'], // Optional - specific draws only
});

// Different scales for different stages
engine.publishEventSeeding({
  eventId,
  stageSeedingScaleNames: {
    MAIN: 'U18',
    QUALIFYING: 'U18Q',
  },
});
```

**API Reference:** [publishEventSeeding](/docs/governors/publishing-governor#publisheventseeding)

## Unpublishing Seeding

```js
engine.unPublishEventSeeding({
  eventId,
  stages: ['MAIN', 'QUALIFYING'], // Optional - specific stages only
});
```

**API Reference:** [unPublishEventSeeding](/docs/governors/publishing-governor#unpublisheventseeding)
