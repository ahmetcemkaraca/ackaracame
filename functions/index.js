import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import admin from "firebase-admin";
import { generateDailyBlogPost } from "./dailyBlogGenerator.js";

admin.initializeApp();

const NEWS_API_KEY = defineString("NEWS_API_KEY", { description: "NewsAPI key" });
const OPENAI_API_KEY = defineString("OPENAI_API_KEY", { description: "OpenAI API key" });
const GITHUB_TOKEN = defineString("GITHUB_TOKEN", { default: "", description: "GitHub PAT for private repos" });
const GITHUB_REPO = defineString("GITHUB_REPO", { default: "ahmetcemkaraca/ackaracame", description: "owner/repo" });
const MANUAL_TRIGGER_SECRET = defineString("MANUAL_TRIGGER_SECRET", { default: "", description: "Manual trigger secret (optional)" });

/**
 * Runs daily at 9:00 AM Turkey time.
 * Collects data from GitHub, NewsAPI, Firestore (paftas, projects, inspirations),
 * sends to AI, and creates one blog post.
 */
export const generateDailyPost = onSchedule(
  {
    schedule: "0 9 * * *",
    timeZone: "Europe/Istanbul",
    retryCount: 2,
    region: "europe-west1",
  },
  async () => {
    await generateDailyBlogPost({
      newsApiKey: NEWS_API_KEY.value(),
      openaiApiKey: OPENAI_API_KEY.value(),
      githubToken: GITHUB_TOKEN.value(),
      githubRepo: GITHUB_REPO.value(),
    });
  }
);

/**
 * Manual trigger for testing. Call with ?secret=YOUR_SECRET
 * Set MANUAL_TRIGGER_SECRET before use.
 */
export const generateDailyPostManual = onRequest(
  { region: "europe-west1" },
  async (req, res) => {
    const secret = MANUAL_TRIGGER_SECRET.value();
    if (secret && req.query.secret !== secret) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    try {
      await generateDailyBlogPost({
        newsApiKey: NEWS_API_KEY.value(),
        openaiApiKey: OPENAI_API_KEY.value(),
        githubToken: GITHUB_TOKEN.value(),
        githubRepo: GITHUB_REPO.value(),
      });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);
