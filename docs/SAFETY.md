# Safety

AI for Meaning sits in self-awareness and inner health. It is not therapy, medical care, diagnosis,
screening, crisis intervention or a substitute for human care. Safety features are load-bearing.

## Principles

- **Gentle by construction.** Short sessions, movement before stillness, every stage skippable, no
  long silent sitting for newcomers.
- **No risky techniques.** No hyperventilation, maximal breathing, breath retention, cold exposure or
  trance induction anywhere in the product or practice library. Breathing guidance is optional,
  comfortable and interruptible; the 6 cycles/min pace is a labelled, adjustable visual option.
- **Ground is always one tap away** during every deeper stage.
- **Deterministic safety copy.** Ground and high-risk responses are fixed, reviewed text in
  `content/mirror-copy.ts`. No model ever generates them.
- **Human help is visible**, framed calmly, without alarm.

## Storm (correction to the prototype)

The prototype described Storm partly as "faster breathing". Production Storm invites shaking hands
and arms, shoulder movement, stretching, scribbling, humming or sighing, a long comfortable exhale and
feeling the feet — each with "if it feels right" framing and a visible skip. The Storm visual raises
energy with wider, faster orbits and soft amber sparks, but its breath envelope is modest (7
cycles/min, depth 0.45) and never presented as a breathing instruction.

## Ground

Reachable from `weather`, `consent`, `storm`, `transition_to_stillness`, `stillness`, `song` and
`paused` (`canGround` in `lib/mirror/machine.ts`; E2E test for each stage on desktop and mobile).
Selecting it immediately:

1. transitions the machine to `grounding` (time no longer advances; `RESUME` has no effect);
2. silences audio (`AmbientAudio.silence`, 250 ms fade) and hides the sound control;
3. stops any Trace and releases the microphone;
4. switches the field to `GROUND_SCENE` within ~0.8 s: sparse, neutral, near-still, **no pacing**;
5. shows plain steps — look around the room, three ordinary things, feel the surface, you can end
   here — and three choices: **End session**, **Stay here**, **Human help**.

Ending from Ground finishes without asking the person to decide about saving.

## The narrow safety gate

`lib/safety/gate.ts` is **not** a distress classifier, risk predictor or diagnostic tool. It matches a
short, reviewed list of explicit phrases (English, plus a few French, Spanish and German forms) that
plainly refer to suicide, self-harm, overdose or being unsafe.

- It runs only on text the person types (the Song reflection field) — before any network call.
- On a match the Mirror stops reflection and opens the high-risk Ground variant: "It sounds like things
  may be very hard right now. The reflections have stopped. This is a moment for a person, not an
  app", the emergency-number line, a helpline directory and a statement that this is not a crisis
  service. The person keeps agency (Stay here / End session).
- Nothing about a match is stored or transmitted.
- **Known limits:** false negatives are expected — distress is expressed in countless ways — which is
  why Ground and human help are available regardless. False positives are acceptable because the
  response is gentle. It never analyses voice, prosody, timing, drawings or behaviour. No suicide-risk
  prediction is attempted and no clinical validation is claimed.

Tests: `tests/unit/safety-gate.test.ts`, E2E `high-risk words stop reflection and show human help`.

## Help resources

Default: [Find A Helpline](https://findahelpline.com), an international directory of free,
confidential helplines, plus "contact your local emergency number". Operators can set
`HELP_RESOURCE_URL` (https only) and `HELP_RESOURCE_LABEL`. **Before launch, have the help copy and
resource reviewed by someone qualified in crisis signposting for the intended audience.**

## The Witness-Companion

Contract (`lib/companion/types.ts`): reflect the person's own words, ask one open question, offer a
brief pointer, or return `ground`.

Constraints (`lib/companion/constraints.ts`), applied to every local template in tests and to every
cloud response at runtime — any violation discards the response and substitutes a local reflection:

- ≤ 200 characters, ≤ 2 sentences, no markup or links;
- no diagnosis or clinical labels; no *you should/must/need to*; no treatment, therapy, medication or
  nervous-system claims; no causal or trauma interpretation; no "subconscious"/"deep down"; no
  "I can tell/know/sense you…"; no "this means you…"; no claims of consciousness or guidance roles; no
  streak or return nudges; no enlightenment/progress language; no guarantees.

The cloud adapter (`lib/companion/cloud.ts`) is disabled unless `MIRROR_COMPANION_PROVIDER=anthropic`
and a key are set. It sends only the current stage, weather word and the few words typed; it uses a
fixed system prompt restating the rules, a JSON schema for output, an 8 s timeout, one retry, and
server-side refusal fallbacks. Refusals, timeouts, schema failures and constraint violations all fall
back to the local provider. There is no chat interface and no history.

## Onboarding caution

Screen 2 of onboarding states the non-clinical status, that contemplative practice can bring difficult
feelings or memories, that people with trauma, psychosis, dissociation or severe mental-health
conditions should practise with professional guidance, and to stop if something feels wrong. It
links to `/ground`.

## Awe and expansion

Song expansion is slow and brief, paired with a Continue control and Ground. Practices that invite
vastness include "if this feels unsettling, look at something close and ordinary".

## Review checklist for new content

- Could this line be read as an instruction about someone's inner state? Rephrase as an invitation.
- Does it imply measurement, diagnosis or improvement? Remove.
- Does a breathing cue go beyond "comfortable, optional"? Remove.
- Is Ground reachable? Is there a visible way to stop?
- Would the line be harmful if read by someone in crisis? If unsure, don't ship it.
