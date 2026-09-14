# Product language

The canonical copy lives in `content/lexicon.ts` and `content/mirror-copy.ts`. This document explains
the vocabulary and the voice so new copy stays consistent.

## Lexicon

| Term | Meaning | Rules |
| --- | --- | --- |
| **Inner Weather** | Passing thoughts, feelings, sensations | Weather changes; the person is never reduced to it. No preset is good or bad. |
| **The Witness** | The noticing itself | Contemplative language only. In science copy use *present-moment awareness*, *decentering*, *interoception*, *experiential self-reference*. |
| **Storm** | Embodied release | Movement, shaking, stretching, scribbling, humming, sighing, feet on the floor. Never hyperventilation, breath-holding or forced breathing. Always invitational and skippable. |
| **Stillness** | Witnessing | Unhurried awareness. Guidance thins, then the interface recedes. |
| **Song** | Aliveness | Curiosity, warmth, gratitude, awe, meaning. Never confetti, scores or congratulations. |
| **The Mirror** | The whole reflective system | The Resonance (art/sound), the Witness-Companion (few words), the Fade (receding guidance). |
| **Traces** | Optional inputs | Breath, Pulse, Motion, Voice, Word. Each needs consent, visible state, a stop control, no hidden recording. Unbuilt Traces say "not yet available". |
| **Attunements** | Presence, Rootedness, Spaciousness, Aliveness, Meaning | Lenses, never scores, grades, percentages or achievements. |
| **Inner Sky** | Visual memory of kept sessions | A constellation, not a dashboard. Tooltips state facts: `12 Sep · Stillness · 4 min · one prompt`. |
| **Depths** | Arrival → Meeting the Weather → The Watcher → The Space Between → Song → Open Sky | Invitations, never "levels". |
| **The Gathering** | Company without comparison | Real, anonymous, ephemeral counts. Zero reads "The space is quiet right now." |
| **The Ground** | Safety | Deterministic, reviewed text. Stops escalation, sound and pacing. |
| **The Honest Mirror** | Disclosure | Capabilities, limits, evidence, non-clinical status. |

## Voice

Sparse, intelligent, humane, calm, precise; occasionally poetic; never mystical where science is
expected. The software invites and asks. It does not instruct, promise or evaluate.

**Do**

- "How is your inner weather right now?"
- "This is the weather. You are the one noticing it."
- "Let something move, if movement feels right."
- "You can stay still, move, or skip this entirely."
- "Nothing to improve for a moment."
- "What feels quietly alive right now?"
- "Nothing needed to happen."
- "The mirror can become quieter from here."
- "Look around the room. Let the screen become ordinary again."

**Don't**

- Imperatives about inner states: "Relax." "Let go of your anxiety."
- Clinical or diagnostic words: anxiety, depression, trauma, symptoms, disorder, regulate.
- Growth-hacking and wellness clichés: *unlock your potential, transform your life, optimise your
  wellbeing, journey to your best self, AI-powered wellness, evidence-based healing, elevate your
  consciousness, regulate your nervous system.*
- Claims of AI knowledge or authority: "I can tell…", "This means…", "Your subconscious…".
- Engagement hooks: streaks, reminders, "don't break the chain", "come back tomorrow".

## Companion wording

The Witness-Companion may only reflect the person's own words, ask one open question, offer a brief
pointer, or hand off to Ground. The enforced rule set is `lib/companion/constraints.ts`; every local
template is tested against it.

## Disclosure lines

Use consistently, without alarm:

- "self-awareness · private by default · not therapy"
- "For self-awareness and inner health. Not therapy, medical care or a crisis service."
- "Research here informs the design; it does not establish that AI for Meaning provides clinical benefit."
