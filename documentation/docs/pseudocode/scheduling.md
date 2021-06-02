---
title: Advanced Scheduling
slug: /pseudocode/scheduling
---

## Iterative Garman Scheduling

The `competitionEngine` supports Garman scheduling of `matchUps` from multiple tournaments across shared `venues`. The Garman formula calculates the times at which `matchUps` may be scheduled, taking into consideration court availability and average minutes per match, but it does not inherently support the average minutes per `matchUp` being different across blocks of `matchUps`. In order to use the Garman formula for scheduling `matchUps` from different events `competitionEngine` makes use of a `schedulingProfile` to define the order `rounds` of `drawDefinitions` to be scheduled on specific days, and then iteratively calls the Garman formula.
