# Günlük Blog Oluşturucu

Her gün saat 09:00 (Türkiye) GitHub, NewsAPI ve Firestore verilerinden rastgele 4-5 kaynak seçip AI ile blog yazısı üretir.

## Kurulum

1. Bağımlılıkları yükle: `npm install`
2. Parametreleri ayarla: Firebase Console > Project Settings > Functions > Configuration > Parameters
   - `NEWS_API_KEY` (zorunlu)
   - `OPENAI_API_KEY` (zorunlu)
   - `GITHUB_TOKEN` (opsiyonel - gizli repo için)
   - `GITHUB_REPO` (varsayılan: ahmetcemkaraca/ackaracame)
   - `MANUAL_TRIGGER_SECRET` (opsiyonel - manuel tetikleme için)
3. Deploy: `firebase deploy --only functions`

## Yerel Test

```powershell
cp .env.example .env
# .env dosyasına API anahtarlarını ekle
firebase emulators:start --only functions
```

## Manuel Tetikleme

`generateDailyPostManual` HTTP fonksiyonuna istek at: `https://REGION-PROJECT.cloudfunctions.net/generateDailyPostManual?secret=YOUR_SECRET`

## API Anahtarları

- **NewsAPI**: [newsapi.org](https://newsapi.org) - ücretsiz geliştirme key
- **OpenAI**: [platform.openai.com](https://platform.openai.com) - API key
- **GitHub**: [github.com/settings/tokens](https://github.com/settings/tokens) - repo erişimi (gizli repo için zorunlu)
