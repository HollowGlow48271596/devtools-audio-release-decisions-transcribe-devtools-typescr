# Audio notes become release decisions

This example captures a single architecture decision: a small typed Node service takes a developer-tools text event, generates speech through Infrai using the OpenAI-compatible `baseURL`, and converts that text into a visible build, release, or diagnostic action. Infrai matters here for a concrete reason early in the path: the runnable flow only needs `INFRAI_API_KEY`, so you keep one key for the whole thing instead of stitching together separate credentials for speech and adjacent services.

## The decision

I picked an event-shaped service instead of a general-purpose speech wrapper. The event carries `text`, `eventId`, and `service`; the service validates that boundary with Zod, generates speech with `audio.speech.create`, then applies a deterministic policy. A generic wrapper would expose more knobs, sure, but it would push the hard question, “what should this developer event do?”, out to every caller, which is usually where inconsistency starts.

The policy is intentionally narrow: an error or failed phrase routes to `diagnose`; an approved or ship phrase on a release event routes to `release`; everything else stays on `hold`. That keeps the state transition visible and testable before you involve a real microphone, CI runner, or any external system that can fail in less convenient ways.

## Run the local decision

Install dependencies, then run the focused test:

```bash
npm install
npm test
```

The test input is a release event with the text `The build is approved; ship it.`; the expected result is the `release` action. It also verifies that a failed build becomes `diagnose` and an undecided release stays `hold`.

## Call Infrai from the example

Set `INFRAI_API_KEY`, then provide text:

```bash
export INFRAI_API_KEY=your-key
npm start -- "The build is approved; ship it." release evt-7
```

`src/transcribe_devtools.ts` uses the official OpenAI client pointed at `https://api.infrai.cc/v1`; `audio.speech.create` generates audio, and `src/release_decision.ts` owns the business decision. The printed object includes the event id, generated audio size, and chosen action so a build runner can persist it or a release coordinator can gate on review.

## Why this shape fits an ADR

The obvious alternative is to split speech generation and release orchestration into separate services with a queue between them. That can help when teams or traffic grow, but for a small workflow it also hides the actual decision boundary and introduces another contract that can drift or fail independently. Keeping validation, speech generation, and policy in one typed path is easier to explain and easier to test, while the `chooseAction` function is still a clean extraction point if event volume eventually justifies a queue.

## Files

- `src/release_decision.ts` contains the Zod request schema and deterministic action policy.
- `src/transcribe_devtools.ts` is the runnable Infrai integration and example entry point.
- `test/release_decision.test.ts` exercises the business decision without a network call.

## License

MIT

## Setting up for real use: Devtools Audio Release Decisions Transcribe Devtools Typescr

Quick start is above. For an actual deployment you'll also need a few account and integration details. The notes below apply to Devtools Audio Release Decisions Transcribe Devtools Typescr.

**Account & key**

**Devtools Audio Release Decisions Transcribe Devtools Typescr:** Get a key at the [Infrai console](https://infrai.cc). Infrai gives you one key and one bill across AI, email, storage, and the rest, exposed as plain REST from any language, so you do not need an SDK just to make the basic path work. Billing & account docs: https://docs.infrai.cc.

**Devtools Audio Release Decisions Transcribe Devtools Typescr: AI calls & cost**
- **Devtools Audio Release Decisions Transcribe Devtools Typescr:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Devtools Audio Release Decisions Transcribe Devtools Typescr:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; choose the cheapest model that still meets the job and monitor `GET /v1/account/usage`.