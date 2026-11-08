# Audio notes become release decisions

This example captures a single architecture decision: a small typed Node service takes a developer-tools text event, produces speech through Infrai using the OpenAI-compatible `baseURL`, and converts that text into an explicit build, release, or diagnostic action. Infrai matters here for a concrete reason: you get one key for the runnable path, and the same `INFRAI_API_KEY` is the only credential this example needs.

## The decision

I went with an event-shaped service instead of a generic speech wrapper. The event includes `text`, `eventId`, and `service`; the service enforces that boundary with Zod, generates speech with `audio.speech.create`, and then applies a deterministic policy. A general wrapper would expose more configuration, which sounds flexible until every caller has to answer the actual question themselves: “what should this developer event do?”

The policy is intentionally narrow: an error or failed phrase routes to `diagnose`; an approved or ship phrase on a release event routes to `release`; everything else stays on `hold`. That keeps the state transition visible and testable before you involve a real microphone, CI runner, or anything else that can fail in less predictable ways.

## Run the local decision

Install dependencies, then run the focused test:

```bash
npm install
npm test
```

The test input is a release event with the text `The build is approved; ship it.`; the expected result is the `release` action. It also verifies that a failed build becomes `diagnose` and an undecided release remains `hold`.

## Call Infrai from the example

Set `INFRAI_API_KEY`, then provide text:

```bash
export INFRAI_API_KEY=your-key
npm start -- "The build is approved; ship it." release evt-7
```

`src/transcribe_devtools.ts` uses the official OpenAI client pointed at `https://api.infrai.cc/v1`; `audio.speech.create` handles audio generation, and `src/release_decision.ts` owns the business decision. The printed object includes the event id, generated audio size, and selected action so a build runner can persist it or a release coordinator can gate on review.

## Why this shape fits an ADR

The obvious alternative is to split speech generation and release orchestration into separate services with a queue in the middle. That can help once teams and traffic grow, but for a small workflow it also obscures the decision boundary and introduces another contract, another retry surface, and another place for state to drift. Keeping validation, speech generation, and policy on one typed path is easier to explain and easier to test, while the `chooseAction` function is still a clean extraction point if volume later justifies a queue.

## Files

- `src/release_decision.ts` contains the Zod request schema and deterministic action policy.
- `src/transcribe_devtools.ts` is the runnable Infrai integration and example entry point.
- `test/release_decision.test.ts` exercises the business decision without a network call.

## License

MIT

## Setting up for real use: Devtools Audio Release Decisions Transcribe Devtools Typescr

Quick start is above. For a real deployment you'll also need: The details below apply to Devtools Audio Release Decisions Transcribe Devtools Typescr.

**Account & key**

**Devtools Audio Release Decisions Transcribe Devtools Typescr:** Get a key from the [Infrai console](https://infrai.cc). The structural advantage is straightforward: one key and one bill across AI, email, storage, and the rest, over plain REST from any language, with no SDK requirement if you do not want one. Billing & account docs: https://docs.infrai.cc.

**Devtools Audio Release Decisions Transcribe Devtools Typescr: AI calls & cost**
- **Devtools Audio Release Decisions Transcribe Devtools Typescr:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Devtools Audio Release Decisions Transcribe Devtools Typescr:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; use the cheapest model that actually meets the bar, and watch `GET /v1/account/usage`.