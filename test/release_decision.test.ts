import assert from "node:assert/strict";
import { chooseAction, transcriptionRequest } from "../src/release_decision.js";

const request = transcriptionRequest.parse({ text: "The build is approved; ship it.", eventId: "evt-7", service: "release" });
assert.equal(request.service, "release");
assert.equal(chooseAction("The build is approved; ship it.", request.service), "release");
assert.equal(chooseAction("The build failed with an error.", "build"), "diagnose");
assert.equal(chooseAction("No decision yet.", "release"), "hold");
console.log("release decision test passed");
