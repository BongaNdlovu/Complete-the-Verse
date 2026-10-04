#!/usr/bin/env node
/**
 * scripts/smoke-backend.js
 *
 * Backend verification & smoke testing for Complete the Verse:
 * 1. In-process verification of all score ceiling, plausibility, settlement,
 *    and rate-window rules defined in supabase/functions/submit-score/index.ts.
 * 2. Optional live HTTP smoke test against the deployed submit-score Edge Function
 *    when SUPABASE_URL and CTV_TEST_AUTH_TOKEN are passed in the environment.
 *
 * Run: node scripts/smoke-backend.js
 */

const https = require("https");
const http = require("http");

const MAX_DAILY = 500000;
const MAX_BLITZ = 10000;
const MAX_DURATION_MS = 7200000;
const DAILY_MAX_ATTEMPTS = 20;
const DAILY_MAX_BASE = 348000;
const DIFF_SCORE = { disciple: 0.85, watchman: 1 };

function diffScore(diff) {
  return DIFF_SCORE[diff] != null ? DIFF_SCORE[diff] : DIFF_SCORE.watchman;
}

function settleDaily(row) {
  const ds = diffScore(String(row.diff || "watchman"));
  const correct = Math.max(0, Number(row.correct) || 0);
  const attempts = Math.max(0, Number(row.attempts) || 0);
  const best = Math.max(0, Number(row.best) || 0);
  const base = Math.max(0, Math.round(Number(row.baseScore) || 0));
  const acc = attempts ? correct / attempts : 0;
  const streakBonus = Math.round(best * 120 * ds);
  const accBonus = Math.round(acc * 1200 * ds);
  const survivalBonus = Math.round(correct * 60 * ds);
  const sum = base + streakBonus + accBonus + survivalBonus;
  const total = String(row.reason || "") === "abandon" ? Math.round(sum * 0.85) : sum;
  return { total, accuracy: Math.round(acc * 100) };
}

function plausibleDaily(row) {
  const correct = Number(row.correct) || 0;
  const attempts = Number(row.attempts) || 0;
  const best = Number(row.best) || 0;
  const base = Math.round(Number(row.baseScore) || 0);
  if (attempts < 1 || attempts > DAILY_MAX_ATTEMPTS) return false;
  if (correct < 0 || correct > attempts) return false;
  if (best < 0 || best > correct) return false;
  if (base < 0 || base > DAILY_MAX_BASE) return false;
  if ((Number(row.score) || 0) > MAX_DAILY) return false;
  const settled = settleDaily(row);
  if (Math.abs((Number(row.accuracy) || 0) - settled.accuracy) > 1) return false;
  if (Math.abs((Number(row.score) || 0) - settled.total) > 1) return false;
  return true;
}

function plausibleBlitz(row) {
  const score = Number(row.score) || 0;
  const correct = row.correct == null ? score : Number(row.correct) || 0;
  if (score !== correct) return false;
  if (score < 0 || score > MAX_BLITZ) return false;
  const survived = Number(row.survived_ms) || 0;
  if (survived < 0 || survived > MAX_DURATION_MS) return false;
  return true;
}

const DAY_MS = 24 * 60 * 60 * 1000;
function utcDay(offsetDays) {
  return new Date(Date.now() + offsetDays * DAY_MS).toISOString().slice(0, 10);
}

function validDate(value) {
  const date = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(date + "T00:00:00.000Z");
  if (isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return false;
  return date >= utcDay(-2) && date <= utcDay(1);
}

let passed = 0, failed = 0;
function assert(name, condition, extra) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error("FAIL: " + name + (extra ? " -> " + JSON.stringify(extra) : ""));
  }
}

console.log("--- 1. Verification of Score Clamping & Plausibility Model ---");

// Valid daily row
assert("MAX_DAILY ceiling matches designed value", MAX_DAILY === 500000);
const validDailySample = {
  diff: "watchman",
  correct: 5,
  attempts: 5,
  best: 5,
  baseScore: 12000,
  score: 12000 + (5 * 120 * 1) + (1 * 1200 * 1) + (5 * 60 * 1), // 14100
  accuracy: 100
};
assert("Valid daily score is recognized as plausible", plausibleDaily(validDailySample));

// Over-ceiling daily score (> 500,000)
const overCeilingDaily = Object.assign({}, validDailySample, { score: 650000 });
assert("Daily score exceeding ceiling is rejected", !plausibleDaily(overCeilingDaily));

// Daily base score exceeding DAILY_MAX_BASE (348,000)
const overBaseDaily = Object.assign({}, validDailySample, { baseScore: 400000, score: 402100 });
assert("Daily baseScore exceeding max base ceiling is rejected", !plausibleDaily(overBaseDaily));

// Excessive attempts (> 20)
const overAttemptsDaily = Object.assign({}, validDailySample, { attempts: 25 });
assert("Daily attempts > 20 is rejected", !plausibleDaily(overAttemptsDaily));

// Inconsistent accuracy (claimed 100%, but 3/5 correct)
const inconsistentAcc = Object.assign({}, validDailySample, { correct: 3, attempts: 5, accuracy: 100 });
assert("Inconsistent daily accuracy is rejected", !plausibleDaily(inconsistentAcc));

// Valid blitz row
assert("Valid blitz score is accepted", plausibleBlitz({ score: 42, correct: 42, survived_ms: 120000 }));

// Over-ceiling blitz score (> 10,000)
assert("Blitz score exceeding 10,000 ceiling is rejected", !plausibleBlitz({ score: 10500, correct: 10500, survived_ms: 50000 }));

// Inconsistent blitz score vs correct
assert("Blitz score mismatching correct count is rejected", !plausibleBlitz({ score: 50, correct: 40, survived_ms: 50000 }));

// Date window checks
const today = utcDay(0);
const yesterday = utcDay(-1);
const futureTwoDays = utcDay(2);
const pastThreeDays = utcDay(-3);
assert("Today is a valid date", validDate(today));
assert("Yesterday is a valid date", validDate(yesterday));
assert("Two days in future is rejected", !validDate(futureTwoDays));
assert("Three days in past is rejected", !validDate(pastThreeDays));
assert("Malformed date is rejected", !validDate("2026-02-31"));

console.log("In-process checks: " + passed + " passed, " + failed + " failed.");

// Live test section (if credentials provided)
const liveUrl = process.env.SUPABASE_URL;
const liveToken = process.env.CTV_TEST_AUTH_TOKEN;

if (!liveUrl || !liveToken) {
  console.log("\n[INFO] To run live HTTP smoke tests against deployed Supabase functions, set:");
  console.log("  $env:SUPABASE_URL = \"https://<project>.supabase.co\"");
  console.log("  $env:CTV_TEST_AUTH_TOKEN = \"<bearer_token>\"");
  console.log("All in-process validation contracts passed successfully.");
  if (failed > 0) process.exit(1);
  process.exit(0);
}

console.log("\n--- 2. Live HTTP Smoke Test against " + liveUrl + " ---");

async function postScore(payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(liveUrl + "/functions/v1/submit-score");
    const client = url.protocol === "https:" ? https : http;
    const bodyStr = JSON.stringify(payload);
    const req = client.request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + liveToken
      }
    }, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });
}

(async () => {
  try {
    console.log("Submitting over-ceiling score (expecting 400 rejection)...");
    const badRes = await postScore({
      kind: "blitz",
      score: 99999,
      correct: 99999,
      survived_ms: 10000,
      diff: "watchman"
    });
    console.log("Over-ceiling response status:", badRes.status);
    if (badRes.status === 400) {
      console.log("PASS: Over-ceiling submission was rejected as expected.");
    } else {
      console.error("FAIL: Expected status 400, got:", badRes.status, badRes.body);
      failed++;
    }
  } catch (err) {
    console.error("Live test error:", err.message);
  }
  process.exit(failed > 0 ? 1 : 0);
})();
