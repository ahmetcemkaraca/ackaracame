import admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const SHUFFLE = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const PICK = (arr, n) => SHUFFLE(arr).slice(0, Math.min(n, arr.length));

function serializeDoc(doc) {
  const d = doc.data();
  const id = doc.id;
  return { id, ...d, createdAt: d.createdAt?.toMillis?.() ?? d.createdAt };
}

/** Fetch recent GitHub commits (public or with token for private) */
async function fetchGitHubCommits(githubToken, repo) {
  try {
    const [owner, reponame] = repo.split("/");
    const url = `https://api.github.com/repos/${owner}/${reponame}/commits?per_page=10`;
    const headers = { Accept: "application/vnd.github.v3+json" };
    if (githubToken) headers.Authorization = `Bearer ${githubToken}`;
    const res = await fetch(url, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((c) => ({
      source: "github",
      type: "commit",
      message: c.commit?.message || "",
      sha: c.sha?.slice(0, 7),
      date: c.commit?.author?.date,
      url: c.html_url,
    }));
  } catch (e) {
    logger.warn("GitHub fetch failed", e.message);
    return [];
  }
}

/** Fetch news from NewsAPI (architecture, AI, software, design) */
async function fetchNews(newsApiKey) {
  const topics = ["architecture", "artificial intelligence", "software development", "design technology"];
  const results = [];
  for (const q of topics) {
    try {
      const from = new Date();
      from.setDate(from.getDate() - 1);
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&from=${from.toISOString().split("T")[0]}&sortBy=publishedAt&pageSize=5&language=en&apiKey=${newsApiKey}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const articles = data.articles || [];
      for (const a of articles) {
        if (a.title && a.url) {
          results.push({
            source: "news",
            type: "article",
            title: a.title,
            description: a.description || "",
            url: a.url,
            publishedAt: a.publishedAt,
            sourceName: a.source?.name,
          });
        }
      }
    } catch (e) {
      logger.warn("NewsAPI fetch failed for", q, e.message);
    }
  }
  return results;
}

/** Fetch paftas, projects, inspirations from Firestore */
async function fetchFirestoreData() {
  const db = admin.firestore();
  const [paftasSnap, projectsSnap, inspirationsSnap] = await Promise.all([
    db.collection("paftas").orderBy("createdAt", "desc").limit(20).get(),
    db.collection("projects").orderBy("createdAt", "desc").limit(20).get(),
    db.collection("inspirations").orderBy("createdAt", "desc").limit(20).get(),
  ]);

  const paftas = paftasSnap.docs.map((d) => ({
    source: "pafta",
    type: "pafta",
    ...serializeDoc(d),
  }));
  const projects = projectsSnap.docs.map((d) => ({
    source: "project",
    type: "project",
    ...serializeDoc(d),
  }));
  const inspirations = inspirationsSnap.docs.map((d) => ({
    source: "inspiration",
    type: "inspiration",
    ...serializeDoc(d),
  }));

  return [...paftas, ...projects, ...inspirations];
}

/** Call OpenAI-compatible chat completions API, return JSON */
async function callAI(prompt, systemPrompt, openaiApiKey) {
  const url = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");
  return JSON.parse(content);
}

/** Convert AI JSON to blog blocks format */
function aiJsonToBlocks(aiJson) {
  const blocks = [];
  if (aiJson.title) {
    blocks.push({ type: "heading", content: { level: 1, text: aiJson.title } });
  }
  if (aiJson.intro) {
    blocks.push({ type: "text", content: { text: aiJson.intro } });
  }
  const sections = aiJson.sections || [];
  for (const s of sections) {
    if (s.heading) {
      blocks.push({ type: "heading", content: { level: 2, text: s.heading } });
    }
    if (s.content) {
      blocks.push({ type: "text", content: { text: s.content } });
    }
    if (s.quote) {
      blocks.push({ type: "quote", content: { text: s.quote, author: s.quoteAuthor || "" } });
    }
  }
  if (aiJson.conclusion) {
    blocks.push({ type: "heading", content: { level: 2, text: "Sonuç" } });
    blocks.push({ type: "text", content: { text: aiJson.conclusion } });
  }
  return blocks;
}

/** Main: collect data, call AI, save blog post */
export async function generateDailyBlogPost(config) {
  const { newsApiKey, openaiApiKey, githubToken, githubRepo } = config;

  if (!newsApiKey || !openaiApiKey) {
    logger.error("Missing NEWS_API_KEY or OPENAI_API_KEY");
    return;
  }

  logger.info("Starting daily blog post generation");

  const [commits, news, firestoreItems] = await Promise.all([
    fetchGitHubCommits(githubToken, githubRepo),
    fetchNews(newsApiKey),
    fetchFirestoreData(),
  ]);

  const allItems = [...commits, ...news, ...firestoreItems];
  const selected = PICK(allItems, 5);

  if (selected.length === 0) {
    logger.warn("No data sources available, skipping");
    return;
  }

  const systemPrompt = `Sen Ahmet Cem Karaca için ackaraca.me sitesinde yayınlanacak günlük blog yazısı yazıyorsun.
Kullanıcı mimar ve yazılım geliştiricidir. Bağlam olarak verilen maddeleri (GitHub commit'leri, haberler, paftalar, projeler, ilhamlar) inceleyip bunların birleşiminden anlamlı bir blog yazısı üret.
Türkçe yaz. Mimarlık, teknoloji, tasarım ve yazılım temasında tutarlı ol.
Yanıtı MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey ekleme:

{
  "title": "Blog başlığı",
  "summary": "Kısa özet (1-2 cümle, liste/özet için)",
  "intro": "Giriş paragrafı",
  "sections": [
    { "heading": "Bölüm başı", "content": "İçerik metni", "quote": "opsiyonel alıntı", "quoteAuthor": "Kaynak" }
  ],
  "conclusion": "Sonuç paragrafı",
  "category": "Mimarlık|Teknoloji|Tasarım|Düşünceler|Genel"
}`;

  const userPrompt = `Bugünün bağlam verileri (rastgele seçilmiş ${selected.length} adet):\n\n${JSON.stringify(selected, null, 2)}\n\nBu verileri kullanarak günlük blog yazısını JSON formatında üret.`;

  let aiResult;
  try {
    aiResult = await callAI(userPrompt, systemPrompt, openaiApiKey);
  } catch (e) {
    logger.error("AI call failed", e);
    throw e;
  }

  const blocks = aiJsonToBlocks(aiResult);
  const today = new Date().toISOString().split("T")[0];

  const blogPost = {
    title: aiResult.title || "Günlük Notlar",
    summary: aiResult.summary || aiResult.intro?.slice(0, 150) || "",
    category: aiResult.category || "Genel",
    date: today,
    blocks,
    content: aiResult.intro || "",
    description: aiResult.summary || "",
    imageUrl: selected[0]?.images?.[0] || selected.find((s) => s.images?.[0])?.images?.[0] || "",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    source: "auto_daily",
  };

  const docRef = await admin.firestore().collection("blogPosts").add(blogPost);
  logger.info("Daily blog post created", { id: docRef.id, title: blogPost.title });
}
