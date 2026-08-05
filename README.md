# ACKaraca — kişisel portfolyo ve içerik stüdyosu

Ahmet Cem Karaca'nın mimarlık, ürün tasarımı ve yazılım çalışmalarını iki dilde
sunan; statik olarak önceden render edilen, Firebase destekli kişisel sitesi.
Kamuya açık deneyim ile içerik yönetimi birbirinden ayrıdır: ziyaretçiler hızlı
ve indekslenebilir bir snapshot görürken, `/studio` yalnız TOTP ile giriş yapmış
tek yöneticiye açıktır.

## Mimari

- React 19, TypeScript, Vite 8 ve Framer Motion
- İki dilli, erişilebilir ve responsive arayüz
- SSR tabanlı prerender, dinamik sitemap ve sayfa bazlı SEO metadata
- Firestore'da sürümlü `projects`, `journal` ve `siteSettings` sözleşmeleri
- App Check korumalı Cloud Functions ve create-only içerik seed akışı
- TOTP + doğrulanmış e-posta + `admin: true` claim + configured owner e-postası gerektiren özel Studio
- Exact owner e-postası dışında hesap oluşturmayı ve girişi kapatan blocking functions
- İmza, MIME, boyut ve sahiplik kontrolünden geçen staging medya hattı
- Aktif deploy manifestine bağlı Storage erişimi ve sunucu üretimli audit logları
- Kaybolmayan rebuild kuyruğu, canlı revizyon doğrulaması ve fail-closed medya GC
- Eski fiziksel pafta QR bağlantıları için daraltılmış, rate-limitli callable

Kamuya açık istemci; `projects`, `journal` veya `siteSettings` için Firestore'dan
doğrudan belge ya da liste okuyamaz. Tüm genel içerik, ayrıcalıklı build sırasında
daraltılıp doğrulanan snapshot üzerinden sunulur. Bu snapshot
[`src/data/generated-content.json`](src/data/generated-content.json) dosyasına
yazılır ve istemci, prerender ve sitemap aynı kaynağı kullanır.
Kaynak koddaki yerel fallback da yalnız yayımlanmış örneklerden oluşur; taslak ve
arşiv metinleri public JavaScript'e hiçbir koşulda gömülmez. Build bu sınırı
ayrıca fail-closed doğrular.

## Dizinler

```text
src/
  components/        arayüz, deneyim ve Studio bileşenleri
  context/           dil, tema, içerik ve yönetici oturumu
  data/              fallback ve üretilmiş yayın snapshot'ı
  domain/            Zod veri sözleşmeleri ve güvenli URL doğrulaması
  lib/firebase/      Firebase istemcisi ve yönetici repository katmanı
  pages/             kamu sayfaları, pafta görünümü ve Studio
functions/           callable/trigger fonksiyonları ve yönetim scriptleri
scripts/             build, SSR prerender ve statik çıktı araçları
tests/rules/         Firestore ve Storage emülatör güvenlik matrisi
```

## Yerel geliştirme

Gereksinimler: Node.js 22 önerilir (kök paket en az 20.19 ister), npm ve Rules
testleri için Java 21+.

```sh
npm ci
npm ci --prefix functions
cp .env.example .env.local
npm run dev
```

`.env.local` içindeki Firebase web değerleri kimlik değil, istemci
tanımlayıcılarıdır; yine de yalnız doğru projeyi hedeflemelidir. Servis hesabı,
Functions secret'ları, App Check debug tokenı veya yönetici UID/e-postası commit
edilmemelidir. Emülatörleri yalnız
`VITE_FIREBASE_USE_EMULATORS=true` ile yerel ortamda etkinleştirin.

## Kalite kapıları

```sh
npm run typecheck
npm run lint
npm test
npm run test:rules
npm run build
npm run audit:policy
```

Rules testi Firestore ve Storage emülatörlerini başlatır. Test matrisi anonim
Firestore okumalarının snapshot-only sınırını, TOTP + exact owner UID/e-posta
zorunluluğunu, timestamp bütünlüğünü, function-owned koleksiyonları, staging
yüklemelerini, legacy karantinasını ve yayın durumuna değil aktif Hosting dağıtım
manifestine bağlı medyayı kapsar. Audit komutu web/Functions runtime ağaçlarında
sıfır bilinen açık ister; yalnız lockfile'a bağlı Firebase deploy CLI'ındaki iki
upstream moderate advisory, sahip ve son inceleme tarihi bulunan exact-ID
politikasıyla geçici olarak sınırlandırılmıştır. Yeni advisory, paket, severity
veya süre aşımı CI'ı durdurur.

## Firebase ve tek yönetici kurulumu

Prod kurulumu için önce Firebase Authentication'ı Identity Platform'a yükseltin,
e-posta/parola sağlayıcısını ve web App Check'i yapılandırın. Ardından tek owner
hesabını oluşturma, TOTP sağlayıcısını açma, MFA enrollment ve claim verme
sırasını eksiksiz uygulayın. Bu sıra, gerekli parametreler/secrets ve kurtarma
komutları [`functions/README.md`](functions/README.md) içinde belgelenmiştir.

Güvenlik kuralları README içinden kopyalanmamalıdır. Tek kanonik kaynaklar:

- [`firestore.rules`](firestore.rules)
- [`storage.rules`](storage.rules)
- [`firestore.indexes.json`](firestore.indexes.json)

Functions parametreleri için
[`functions/.env.example`](functions/.env.example), tarayıcı yapılandırması için
[`.env.example`](.env.example) başlangıç şablonudur.

## İçerik yayınlama

Studio'da kaydetmek Firestore'un yönetim katmanını günceller; çalışan Hosting
sürümünü veya onun aktif medya manifestini doğrudan değiştirmez. Rebuild kuyruğu
her kayda monotonik bir revizyon verir ve overlap eden değişiklikleri kaybetmeden
birleştirir. Build sağlayıcısı bu revizyonu taşıyarak snapshot'ı domain
şemalarıyla doğrular. Normal editör kaydı, asenkron server outbox henüz revizyon
üretmemiş olabileceği için yalnız “sunucu kuyruğu oluşturulacak” onayı verir ve
canlı yayın iddiasında bulunmaz. Açık manuel/retry isteği ise kendi exact
revizyonunu izler; Studio webhook kabulünü canlı yayın başarısı saymaz ve ancak
`activeContentRevision` hedefe ulaştığında doğrulanmış dağıtım gösterir.

```sh
npm ci
npm ci --prefix functions

FIREBASE_PROJECT_ID='firebase-project-id' \
ACKARACA_EXPORT_FIRESTORE=true \
CONFIRM_CONTENT_EXPORT=ACKARACA_PUBLIC_CONTENT \
npm run build
```

Kimlik doğrulama `FIREBASE_SERVICE_ACCOUNT_JSON`,
`FIREBASE_SERVICE_ACCOUNT_PATH` veya Application Default Credentials ile
sağlanır. Export; proje ID/credential uyuşmazlığında, eksik ayarlarda, geçersiz
kayıtta, duplicate slug'da veya yayınlanmış proje bulunmadığında fail-closed
durur. Eski snapshot'la sessizce devam etmez.

## Deploy

Üretimde çıplak `firebase deploy` yerine aşamalı wrapper kullanılır. Wrapper
önce eski∪yeni medya manifestini hazırlar, gerekli Firebase kaynaklarını dağıtır
ve yalnız tüm zorunlu kaynak fazları doğrulandıktan sonra manifesti tam yeni
snapshot'a daraltır. Bootstrap statik Hosting'i backend'den önce yayınlar. Hata halinde
eski sitenin görselleri erişilebilir kalır; stale veya overlap eden revizyonlar
fail-closed reddedilir. Yalnız başarısız/zaman aşımına uğramış aynı snapshot ve
revizyon güvenli bir yeni deployment ID ile tekrar denenebilir.
Komutu çalıştırmadan önce [`.env.example`](.env.example) içindeki tüm üretim web
değerlerini ve [`functions/.env.example`](functions/.env.example) içindeki dört
Functions parametresini shell ortamına export edin; wrapper eksik, placeholder
veya birbiriyle uyuşmayan ayarlarda build başlamadan durur.

Eski production projesinde ilk kez bu sürüme geçerken sıra güvenlik sınırının bir
parçasıdır:

1. Kök ve Functions bağımlılıklarını lockfile'lardan kurun; `npm run
   audit:policy` ve `node scripts/verify-public-content.mjs` çalıştırın. Identity
   Platform + e-posta/parola sağlayıcısını açın, tek owner hesabını oluşturup
   e-postasını doğrulayın ve üretim parametre/secrets'larını hazırlayın. Revision
   0 wrapper'ı blocking Functions'tan önce bu hesabı read-only doğrular.
2. Storage Rules'ın Firestore'a erişebilmesi için Firebase'in
   [cross-service Rules bağlantısını](https://firebase.google.com/docs/rules/manage-deploy#manage_permissions_for_cross-service_cloud_storage_security_rules)
   etkinleştirin ve Firebase Storage service agent'ının `Firebase Rules
   Firestore Service Agent` rolünü doğrulayın. İlk cross-service rules
   deploy'unda Firebase CLI istemini onaylayın; eksik rol Studio medya
   işlemlerini güvenli biçimde reddeder.
3. Eski `us-central1/adminLoginGuard` ve HTTP `seedContent` export'larını exact
   inventory kontrollü `npm run legacy:retire --prefix functions` komutuyla
   kaldırın. Genel `firebase deploy --force` kullanmayın.
4. `npm run bootstrap:plan` çıktısındaki fallback bundle sayısı ve SHA-256'yı
   inceleyin. Exact `bootstrap-bundled:project:hash` onayı,
   `ACKARACA_BOOTSTRAP_FROM_BUNDLED_CONTENT=true` ve revision `0` ile validated
   bundled fallback'ı deploy edin. Wrapper önce Firestore'dan bağımsız statik
   Hosting'i, yalnız başarısından sonra rules/indexes/Storage/Functions'ı
   dağıtır; iki faz tamamlanmadan medya manifestini finalize etmez. Bu aşama
   Firestore export yapmaz ve yalnız rebuild kuyruğu başlamadan önce çalışır.
5. TOTP sağlayıcısını etkinleştirin, `/studio/setup` üzerinden owner hesabına
   TOTP kaydedin ve exact claim komutunu çalıştırın. Komut admin claim'inin
   yanında client'ların değiştiremediği `systemPolicies/owner-access` UID/e-posta
   bağını da kurar. Çıkış/giriş yapıp normal owner preflight ve `/studio`
   erişimini doğrulayın. Normal deploy wrapper bunu otomatik çalıştırır; manuel
   kontrolün exact `ACKARACA_OWNER_PREFLIGHT_MODE=normal` komutu
   [`functions/README.md`](functions/README.md) içindedir.
6. `npm run legacy:migrate-content --prefix functions` dry-run çıktısındaki
   canonical settings + sekiz proje + iki journal yolunu, sınıflandırmaları,
   local `0600` planı ve SHA-256 özetini inceleyin. Komut collection query
   çalıştırmaz; hiçbir unrelated legacy auto-ID belgesini listelemez veya değiştirmez.
7. Private plandaki her `sourceData` / `replacementData` çiftini inceleyin;
   çıktının exact project+hash+paths ve `reviewed:project:hash` tokenlarının
   ikisiyle `--apply` çalıştırın. Tanınan eski çakışmalar transaction içinde private ve kalıcı
   olarak yedeklenir; valid-v2 belgeler korunur, absent canonical yollar
   create-only oluşturulur, beklenmeyen veri tüm apply'ı durdurur.
8. Migration yazılarının oluşturduğu durable outbox'ın server-issued revision
   `>0` rebuild'ini tamamlayın; bundled bootstrap modunu tekrarlamayın.

Exact onay ifadeleri, credential seçenekleri, private backup yolu ve kurtarma
notları [`functions/README.md`](functions/README.md) içinde belgelenmiştir.

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
ACKARACA_STORAGE_BUCKET='firebase-project-id.firebasestorage.app' \
ACKARACA_CONTENT_REVISION='0' \
ACKARACA_BOOTSTRAP_FROM_BUNDLED_CONTENT='true' \
CONFIRM_BUNDLED_BOOTSTRAP='bootstrap-bundled:firebase-project-id:<sha256-from-bootstrap-plan>' \
CONFIRM_PRODUCTION_DEPLOY='deploy:firebase-project-id' \
npm run deploy:production
```

İlk kurulum revizyonu `0`'dır; daha sonraki değer rebuild webhook gövdesindeki
`revision` olmalıdır. Build sağlayıcısı aynı site için işleri serialize etmeli ve
stale revizyonu çalıştırmamalıdır. Parametreler, abort/finalize kurtarma komutları
ve en az yetkili kimlik sözleşmesi
[`functions/README.md`](functions/README.md) içinde ayrıntılıdır.

Depodaki [`production-deploy.yml`](.github/workflows/production-deploy.yml),
Studio'nun GitHub `repository_dispatch` isteğini `site-rebuild` olayıyla karşılar
ve işleri tek bir production concurrency grubunda sıraya alır. Workflow uzun
ömürlü servis hesabı anahtarı taşımaz; GitHub OIDC ile Workload Identity
Federation kullanır. Production environment secret'ları olarak
`FIREBASE_PROJECT_ID`, `ACKARACA_STORAGE_BUCKET`, `ACKARACA_ADMIN_EMAIL`,
`GCP_WORKLOAD_IDENTITY_PROVIDER` ve `GCP_DEPLOY_SERVICE_ACCOUNT` gerekir.
Environment variable'ları olarak `VITE_FIREBASE_API_KEY`,
`VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_MESSAGING_SENDER_ID`,
`VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_APPCHECK_SITE_KEY`,
`SITE_REBUILD_PROVIDER` ve `SITE_REBUILD_WEBHOOK_HOST` gerekir. Workflow;
web yapılandırmasının Functions projesi/bucket'ıyla tam eşleşmesini ve üretim
parametrelerinin placeholder olmadığını build başlamadan fail-closed doğrular.
Hem manuel deploy ADC kimliğine hem GitHub WIF deploy service account'una owner
preflight için en az yetkili
[`roles/firebaseauth.viewer`](https://firebase.google.com/docs/projects/iam/roles-predefined-product#firebase_authentication_roles)
(`firebaseauth.users.get`) ve `systemPolicies/owner-access` için gerekli scoped
Firestore okumasını verin; geniş Firebase Admin/Owner rolü vermeyin. Media ve
rebuild'in gerekli dar Firestore yazma izinleri ayrıca
[`functions/README.md`](functions/README.md) sözleşmesindedir.
Functions tarafında ise `SITE_REBUILD_PROVIDER=github`,
`SITE_REBUILD_WEBHOOK_HOST=api.github.com`, yalnız bu depoya dispatch yetkili
`SITE_REBUILD_WEBHOOK_TOKEN` secret'ı ve tam
`https://api.github.com/repos/ahmetcemkaraca/ackaracame/dispatches` URL'si
tanımlanmalıdır. Üretim projesi, bucket, IAM bağı ve secret'lar bu depoda
bulunmadığı için yerel doğrulama canlı dağıtım yapmaz.

Workflow keyfî bir manuel revision girdisi kabul etmez: revision ve request ID
yalnız sunucu rebuild kuyruğundan gelir ve deploy kimliği bunları Firestore'daki
kabul edilmiş kayıtla yeniden doğrular. İlk `revision=0` bootstrap dağıtımı,
rebuild kuyruğu başlamadan önce yukarıdaki açık onaylı komutla kontrollü bir
operatör ortamından bir kez yapılır.

## Önemli yollar

- `/` — seçili işler ve genel profil
- `/work` ve `/work/:slug` — portfolyo ve vaka çalışmaları
- `/journal` ve `/journal/:slug` — yazılar ve düşünce arşivi
- `/lab` ve `/lab/:slug` — araştırmalar ve etkileşimli deneyler
- `/pafta/:code` — eski fiziksel QR paftalarının sınırlı kamu görünümü
- `/studio/setup` — tek seferlik TOTP enrollment
- `/studio` — özel içerik yönetimi

Eski `paftas` kayıtlarındaki `status: "active"` değeri kamuya açılmaz. Bu kasıtlı
karantina geriye dönük otomatik migration yapmaz: her belgeyi içerik ve medya
güvenliği açısından elle inceleyip, yalnız gerçekten yayımlanacak olanları
`status: "published"` değerine taşıyın; ardından bileşik index ve Functions
dağıtımını tamamlayın.

## Lisans

Bu depo kişisel portfolyo içeriği ve uygulama kaynaklarını içerir. Yeniden kullanım
öncesinde depo sahibinden izin alın.
