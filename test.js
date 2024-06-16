import test from "node:test";
import { compareHashcode, hashcodeData } from "./validate/app_validate.js";
import assert from "node:assert/strict";

test("compare data and dataHashcode", async () => {
  const password = "123456";
  const hash = await hashcodeData(password, 10);
  const isCorrect = await compareHashcode(password, hash);
  assert.strictEqual(true, isCorrect);
});
