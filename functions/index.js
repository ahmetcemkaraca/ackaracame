import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import admin from 'firebase-admin';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';

admin.initializeApp();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const manifestPath = path.join(__dirname, 'data', 'content-seeds.json');
const defaultSeedToken = 'ackaraca-seed-2026';
const loginSecurityDocPath = 'adminLoginSecurity/default';
const MAX_FAILED_ATTEMPTS = 3;
const LOCK_DURATION_MS = 24 * 60 * 60 * 1000;

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

function getRequestMeta(req) {
	const ip = req.rawRequest?.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.rawRequest?.ip || 'unknown';
	const userAgent = req.rawRequest?.headers['user-agent'] || 'unknown';
	return { ip, userAgent };
}

export const adminLoginGuard = onCall({ cors: true }, async (req) => {
	const db = admin.firestore();
	const payload = req.data || {};
	const action = payload.action;
	const securityRef = db.doc(loginSecurityDocPath);
	const snapshot = await securityRef.get();
	const current = snapshot.exists ? snapshot.data() : {};
	const now = Date.now();
	const lockedUntilMs = current.lockedUntil?.toMillis?.() || 0;

	if (action === 'status') {
		return {
			isLocked: lockedUntilMs > now,
			lockedUntil: lockedUntilMs || null,
			attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - (current.failedAttempts || 0))
		};
	}

	if (action === 'success') {
		await securityRef.set({
			failedAttempts: 0,
			lockedUntil: null,
			lastSuccessfulLoginAt: admin.firestore.FieldValue.serverTimestamp(),
			lastSuccessfulMeta: getRequestMeta(req),
			updatedAt: admin.firestore.FieldValue.serverTimestamp()
		}, { merge: true });

		return { ok: true, isLocked: false, attemptsRemaining: MAX_FAILED_ATTEMPTS };
	}

	if (action === 'failure') {
		if (lockedUntilMs > now) {
			return {
				ok: false,
				isLocked: true,
				lockedUntil: lockedUntilMs,
				attemptsRemaining: 0
			};
		}

		const failedAttempts = (current.failedAttempts || 0) + 1;
		const shouldLock = failedAttempts >= MAX_FAILED_ATTEMPTS;
		const nextLockedUntil = shouldLock ? now + LOCK_DURATION_MS : null;

		await securityRef.set({
			failedAttempts: shouldLock ? 0 : failedAttempts,
			lockedUntil: nextLockedUntil ? admin.firestore.Timestamp.fromMillis(nextLockedUntil) : null,
			lastFailedLoginAt: admin.firestore.FieldValue.serverTimestamp(),
			lastFailedMeta: getRequestMeta(req),
			updatedAt: admin.firestore.FieldValue.serverTimestamp()
		}, { merge: true });

		return {
			ok: false,
			isLocked: shouldLock,
			lockedUntil: nextLockedUntil,
			attemptsRemaining: shouldLock ? 0 : MAX_FAILED_ATTEMPTS - failedAttempts
		};
	}

	throw new HttpsError('invalid-argument', 'Unsupported action.');
});

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
