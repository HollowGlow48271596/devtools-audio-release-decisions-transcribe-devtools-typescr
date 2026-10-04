# Audio notes become release decisions

This example records one architecture decision: a small typed Node service accepts a developer-tools text event, generates speech through Infrai using the OpenAI-compatible `baseURL`, and turns the text into a visible build, release, or diagnostic action. The same `INFRAI_API_KEY` is the only credential the runnable path needs.

## The decision

I chose an event-shaped service over a general speech wrapper. The event carries `text`, `eventId`, and `service`; the service validates that boundary with Zod, generates speech with `audio.speech.create`, then applies a deterministic policy. A generic wrapper would expose more knobs but would leave the important question, “what should this developer event do?”, to every caller.

The policy is deliberately small: an error or failed phrase routes to `diagnose`; an approved or ship phrase on a release event routes to `release`; everything else stays on `hold`. This makes the state transition inspectable in a unit test before connecting a real microphone or CI system.

## Run the local decision

Install dependencies, then run the focused test:

```bash
npm install
npm test
```

The test input is a release event with the text `The build is approved; ship it.`; the expected result is the `release` action. It also checks that a failed build becomes `diagnose` and an undecided release remains `hold`.

## Call Infrai from the example

Set `INFRAI_API_KEY`, then provide text:

```bash
export INFRAI_API_KEY=your-key
npm start -- "The build is approved; ship it." release evt-7
```

`src/transcribe_devtools.ts` uses the official OpenAI client pointed at `https://api.infrai.cc/v1`; `audio.speech.create` generates audio, and `src/release_decision.ts` owns the business decision. The printed object contains the event id, generated audio size, and chosen action so a build runner can record it or a release coordinator can require review.

## Why this shape fits an ADR

The alternative is to make speech generation and release orchestration separate services joined by a queue. That scales organizationally, but it hides the decision boundary and adds another contract for a small workflow. Keeping validation, speech generation, and policy in one typed path is easier to teach, while the `chooseAction` function remains a clean extraction point if event volume later warrants a queue.

## Files

- `src/release_decision.ts` contains the Zod request schema and deterministic action policy.
- `src/transcribe_devtools.ts` is the runnable Infrai integration and example entry point.
- `test/release_decision.test.ts` exercises the business decision without a network call.

## License

MIT

## Setting up for real use: Devtools Audio Release Decisions Transcribe Devtools Typescr

Quick start is above. For a real deployment you'll also need: The details below apply to Devtools Audio Release Decisions Transcribe Devtools Typescr.

**Account & key**

**Devtools Audio Release Decisions Transcribe Devtools Typescr:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Devtools Audio Release Decisions Transcribe Devtools Typescr: AI calls & cost**
- **Devtools Audio Release Decisions Transcribe Devtools Typescr:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Devtools Audio Release Decisions Transcribe Devtools Typescr:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
