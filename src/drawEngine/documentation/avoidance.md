---
name: Avoidance
menu: Draw Engine
route: /drawEngine/avoidance
---

# Avoidance

Avoidance is an attempt to insure that grouped players do not encounter each other in early rounds (or just the first round) of an elimination draw structure, or that round robin brackets are generated such that players from the same group are evenly distributed across brackets and do not encounter each other unless there are more group members than there are brackets.

Avoidance can be applied to [Seed Blocks](/drawEngine/seedPositiioning#seed-blocks) as well as unseeded players, though Seeded players may only be moved to other positions valid for the Seed Block within which they are placed.

## Single Round Avoidance

Single Round Avoidance an be accomplished by random placement followed by an iterative shuffling algorithm which generates a score for each player distribution and which runs through a set number of iterations, or by iterative attempts to resolve conflicts by searching for alternate player positions.  In some cases where single round avoidance is the goal it is specifically forbidden to attempt to maximize player separation within a draw, a constratint which prohibits some multiple round avoidance strategies.

## Multiple Round Avoidance

Multiple Round Avoidance seeks to place players as far apart within a draw structure as possible.  This can be accomplished by dividing a draw structure into sections based on the number of players within a given group and distributing a group's players evenly across these sections, randomizing section placement if there are more sections than players in a given group.  This process would be repeated for each group starting with the largest group.  There are scenarios where players in smaller groups end up having only adjacent positions available when it comes to their distribution which necessitates a shuffling step for previously placed groups.
