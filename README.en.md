# Saut stellaire (Star jump)

An endless run on a distant planet: your hero runs on their own, and it is up to you to jump over crystals at the right moment, stay on the ground under meteors and catch the stars. The speed rises as you go.

*Version française : [README.md](README.md)*

## Controls

- **Space**, **↑** or **click**: jump. **Hold** to jump higher.
- **Press again in the air**: double jump.
- **↓**: drop down fast.
- **P** or **Escape**: pause.
- After a fall, **Space** starts a new run.

## Obstacles

- **Crystals**: they stick out of the ground; jump over them.
- **Meteors**: they fly at head height after the first moments; stay on the ground so they pass over you.

The gap between two obstacles always leaves time for a jump at the current speed, but it shrinks with distance. The speed rises little by little, to more than twice the starting speed.

## Stars and bonuses

- **Stars** float alone or in threes. Caught in a row, they form a **streak**: the multiplier rises by 1 every 5 stars, up to ×4. Letting a star go by resets the streak.
- The **shield** takes one hit for you; one appears now and then when you do not have one.

## Points

The score is 1 point per 10 metres run, plus 25 points per star times the current multiplier. A banner marks every thousand metres.

## Data and sync

Your record is stored by NeoDex, backed up and synced between your PCs when sync is on. On first launch, the plugin picks up what you already had in NeoDex.

## Install

In NeoDex: **NeoStore → Discover → Saut stellaire → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
