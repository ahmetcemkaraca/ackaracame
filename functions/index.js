import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';

admin.initializeApp();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const manifestPath = path.join(__dirname, 'data', 'content-seeds.json');
const defaultSeedToken = 'ackaraca-seed-2026';

function loadContentManifest() {
	if (!fs.existsSync(manifestPath)) {
		throw new Error(`Seed manifest not found: ${manifestPath}`);
	}

	return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

async function upsertCollection(collectionName, items) {
	const db = admin.firestore();

	for (const item of items) {
		await db.collection(collectionName).doc(item.id).set({
			...item,
			createdAt: admin.firestore.FieldValue.serverTimestamp(),
			updatedAt: admin.firestore.FieldValue.serverTimestamp()
		}, { merge: true });
	}
}

export const seedContent = onRequest({ cors: false }, async (req, res) => {
	try {
		const token = req.query.token || req.header('x-seed-token');
		const expectedToken = process.env.MANUAL_TRIGGER_SECRET || defaultSeedToken;

		if (token !== expectedToken) {
			res.status(403).json({ ok: false, error: 'Forbidden' });
			return;
		}

		const manifest = loadContentManifest();

		await upsertCollection('projects', manifest.projects || []);
		await upsertCollection('applications', manifest.applications || []);

		res.status(200).json({
			ok: true,
			projects: (manifest.projects || []).map((item) => item.id),
			applications: (manifest.applications || []).map((item) => item.id)
		});
	} catch (error) {
		res.status(500).json({ ok: false, error: error.message });
	}
});
