---
name: Overview
menu: Draw Engine
route: /drawEngine/overview
---

# Overview

## design goals

- provide an api for the manipulation of draw definitions implemented in JSON
- insure the integrity of draw definitions by managing all state transformations

## draw scope

drawEngine views all connected structures as a single draw. A **Compass Draw**, for instance, may contain from 2 to 8 connected elimination structures. A **Championship Feed-In** contains two closely linked structures, traditionally referred to as the "Main" draw and the "Consolation" draw. Rather than treat these as separate draws, drawEngine views them as stages of a single draw, the aggregate structure.

## Folder Structure

1. accessors: functions which process passed entities with no external dependencies
2. getters: functions which locate entities within current drawDefinition
3. generators: functions which produce entities
4. governors: functions which govern state transformations within entities
