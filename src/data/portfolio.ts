import {
  parseContentBundle,
  type ContentBundle,
  type JournalEntry,
  type PortfolioProject,
  type SiteSettings,
} from '../domain/content';
import generatedContent from './generated-content.json';

const localized = (tr: string, en: string) => ({ tr, en });

const fallbackBundle = {
  settings: {
    siteName: localized('ACKaraca.me', 'ACKaraca.me'),
    ownerName: localized('Ahmet Cem Karaca', 'Ahmet Cem Karaca'),
    headline: localized(
      'Mimarlık ve yazılım arasında çalışan bir mimar ve geliştirici.',
      'An architect and developer working between architecture and software.',
    ),
    introduction: localized(
      'Karmaşık fikirleri okunur mekânlara, ürünlere ve araçlara dönüştürüyorum. Bu portfolyo; mimari düşünceyi, ürün geliştirmeyi ve deneysel üretimi aynı editoryal çatı altında toplar.',
      'I turn complex ideas into legible spaces, products, and tools. This portfolio brings architectural thinking, product development, and experimental making under one editorial roof.',
    ),
    location: localized('Birleşik Krallık / Türkiye · Uzaktan', 'UK / Türkiye · Remote'),
    contactEmail: 'info@ackaraca.me',
    canonicalUrl: 'https://ackaraca.me',
    defaultLocale: 'tr',
    supportedLocales: ['tr', 'en'],
    availability: 'open-to-inquiries',
    socialLinks: [
      {
        kind: 'social',
        label: localized('GitHub profili', 'GitHub profile'),
        href: 'https://github.com/ahmetcemkaraca',
        newTab: true,
      },
    ],
    palette: {
      background: '#f5f2ea',
      foreground: '#121417',
      accent: '#197fe6',
    },
    footerNote: localized(
      'Mimarlık, ürün ve yazılım üzerine seçilmiş çalışmalar.',
      'Selected work across architecture, products, and software.',
    ),
    defaultSeo: {
      title: localized(
        'Ahmet Cem Karaca — Mimar ve Geliştirici',
        'Ahmet Cem Karaca — Architect and Developer',
      ),
      description: localized(
        'Ahmet Cem Karaca’nın mimarlık, yazılım, dijital ürün ve deneysel üretim çalışmalarından oluşan iki dilli kişisel portfolyosu.',
        'The bilingual portfolio of Ahmet Cem Karaca, spanning architecture, software, digital products, and experimental making.',
      ),
      noIndex: false,
    },
  },
  projects: [
    {
      slug: 'draw-or-die',
      status: 'published',
      discipline: 'hybrid',
      format: 'product',
      order: 10,
      featured: true,
      title: localized('Draw Or Die', 'Draw Or Die'),
      dek: localized(
        'Mimari pafta, render ve PDF’leri farklı jüri bakışlarıyla inceleyen yapay zekâ destekli mimarlık jüri simülatörü.',
        'An AI-assisted architecture jury simulator that reviews boards, renders, and PDFs through distinct critic perspectives.',
      ),
      year: 2026,
      context: localized('Kişisel çalışma', 'Personal work'),
      technologies: [
        'Next.js 15',
        'React 19',
        'TypeScript',
        'Tailwind CSS',
        'Framer Motion',
        'Appwrite',
        'Gemini',
        'Stripe',
      ],
      topics: ['architecture', 'ai-critique', 'design-review'],
      cover: {
        slug: 'draw-or-die',
        palette: ['#0f172a', '#f8fafc', '#ef4444'],
        visualVariant: 'code-canvas',
        alt: localized(
          'Draw Or Die mimarlık jüri simülasyonu',
          'Draw Or Die architecture jury simulation',
        ),
      },
      media: [],
      links: [
        {
          kind: 'source',
          label: localized('GitHub reposu', 'GitHub repository'),
          href: 'https://github.com/ahmetcemkaraca/draw-or-die',
          newTab: true,
        },
      ],
      metrics: [
        {
          id: 'analysis-modes',
          label: localized('Analiz modu', 'Analysis modes'),
          value: localized('9', '9'),
          context: localized(
            'Kapsam sayısı, projenin herkese açık README belgesinde listelenen analiz modlarına dayanır.',
            'This scope count comes from the analysis modes listed in the public project README.',
          ),
          verified: true,
        },
        {
          id: 'jury-personas',
          label: localized('Jüri personası', 'Jury personas'),
          value: localized('6', '6'),
          context: localized(
            'Kapsam sayısı, projenin herkese açık README belgesinde listelenen jüri personalarına dayanır.',
            'This scope count comes from the jury personas listed in the public project README.',
          ),
          verified: true,
        },
      ],
      blocks: [
        {
          id: 'draw-or-die-intent',
          type: 'text',
          eyebrow: localized('Ürün fikri', 'Product idea'),
          heading: localized('Jüri provasını yapılandırılmış geri bildirime çevirmek', 'Turning jury rehearsal into structured feedback'),
          body: localized(
            'Draw Or Die; mimarlık öğrencilerinin pafta, render ve PDF teslimlerini bir jüri öncesinde farklı eleştiri biçimleriyle sınamasına odaklanıyor. Analiz çıktısı revizyon akışına taşınabiliyor; savunma sohbeti ise kullanıcının tasarım kararlarını sözlü olarak gerekçelendirmesine alan açıyor.',
            'Draw Or Die helps architecture students test boards, renders, and PDF submissions through different forms of critique before a jury. Analysis can feed a revision flow, while defence chat gives users room to articulate and justify design decisions.',
          ),
        },
        {
          id: 'draw-or-die-system',
          type: 'text',
          eyebrow: localized('Sistem', 'System'),
          heading: localized('Analiz, savunma ve topluluk katmanları', 'Analysis, defence, and community layers'),
          body: localized(
            'Next.js 15, React 19 ve TypeScript ürün yüzeyini; Appwrite veri ve kimlik katmanlarını; Gemini yapay zekâ analizini destekliyor. Stripe ürünün ödeme akışında yer alırken topluluk galerisi, incelenen çalışmalar için ayrı bir keşif yüzeyi sağlıyor.',
            'Next.js 15, React 19, and TypeScript support the product surface; Appwrite supports data and identity; and Gemini supports AI analysis. Stripe is part of the payment flow, while the community gallery provides a separate discovery surface for reviewed work.',
          ),
        },
        {
          id: 'draw-or-die-facts',
          type: 'facts',
          heading: localized('Proje profili', 'Project profile'),
          items: [
            {
              label: localized('Biçim', 'Format'),
              value: localized('Mimarlık jüri simülatörü', 'Architecture jury simulator'),
            },
            {
              label: localized('Odak', 'Focus'),
              value: localized('Analiz, revizyon ve savunma', 'Analysis, revision, and defence'),
            },
          ],
        },
      ],
      relatedSlugs: ['archbuilder', 'beatforge'],
      seo: {
        title: localized(
          'Draw Or Die — Yapay Zekâ Mimarlık Jürisi',
          'Draw Or Die — AI Architecture Jury',
        ),
        description: localized(
          'Pafta, render ve PDF analizi; revizyon akışı, savunma sohbeti ve topluluk galerisi sunan yapay zekâ destekli mimarlık jüri simülatörü.',
          'An AI-assisted architecture jury simulator for board, render, and PDF analysis, with revision, defence chat, and a community gallery.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'mailcrush',
      status: 'published',
      discipline: 'software',
      format: 'product',
      order: 30,
      featured: true,
      title: localized('MailCrush', 'MailCrush'),
      dek: localized(
        'Gelen e-postaları kısa, okunur özetlere dönüştürmek için tasarlanmış yapay zekâ destekli bir e-posta servisi.',
        'An AI-assisted email service designed to turn inbound messages into concise, readable digests.',
      ),
      year: 2026,
      context: localized('Kişisel çalışma', 'Personal work'),
      technologies: ['Next.js', 'FastAPI', 'OpenAI', 'Firebase', 'Stripe'],
      topics: ['email', 'ai', 'subscription'],
      cover: {
        slug: 'mailcrush',
        palette: ['#111827', '#e2e8f0', '#8b5cf6'],
        visualVariant: 'signal-field',
        alt: localized('MailCrush e-posta özet akışı', 'MailCrush email digest flow'),
      },
      media: [],
      links: [],
      metrics: [],
      blocks: [
        {
          id: 'mailcrush-purpose',
          type: 'text',
          eyebrow: localized('Ürün fikri', 'Product idea'),
          heading: localized('Gelen kutusunu özet katmanına çevirmek', 'Turning the inbox into a digest layer'),
          body: localized(
            'MailCrush, gelen e-postayı alıp OpenAI tabanlı kısa bir özete dönüştüren bir servis kurgusuna sahip. Amaç, mesajın anlamını koruyan daha küçük bir okuma yüzeyi oluşturmak.',
            'MailCrush is structured as a service that receives email and turns it into a short OpenAI-assisted summary. The goal is a smaller reading surface that preserves the meaning of the message.',
          ),
        },
        {
          id: 'mailcrush-architecture',
          type: 'text',
          eyebrow: localized('Teknik omurga', 'Technical spine'),
          heading: localized('Ürün ve servis katmanlarını ayırmak', 'Separating product and service layers'),
          body: localized(
            'Next.js arayüz katmanını, FastAPI servis akışını taşır. Firebase kimlik doğrulamayı, Stripe ise abonelik yapısını desteklemek üzere mevcut proje tanımında yer alır.',
            'Next.js carries the interface layer while FastAPI handles the service flow. Firebase is listed for authentication and Stripe for the subscription structure in the current project definition.',
          ),
        },
        {
          id: 'mailcrush-facts',
          type: 'facts',
          heading: localized('Proje profili', 'Project profile'),
          items: [
            {
              label: localized('Girdi', 'Input'),
              value: localized('Gelen e-posta', 'Inbound email'),
            },
            {
              label: localized('Çıktı', 'Output'),
              value: localized('Kısa e-posta özeti', 'Concise email digest'),
            },
          ],
        },
      ],
      relatedSlugs: ['peakactivity', 'hocapuanla'],
      seo: {
        title: localized(
          'MailCrush — Yapay Zekâ Destekli E-posta Özeti',
          'MailCrush — AI-Assisted Email Digests',
        ),
        description: localized(
          'Next.js, FastAPI, OpenAI, Firebase ve Stripe katmanlarını birleştiren yapay zekâ destekli e-posta özetleme servisi.',
          'An AI-assisted email digest service combining Next.js, FastAPI, OpenAI, Firebase, and Stripe.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'beatforge',
      status: 'published',
      discipline: 'software',
      format: 'experiment',
      order: 60,
      featured: false,
      title: localized('BeatForge', 'BeatForge'),
      dek: localized(
        'Tekrar üretilebilir müzik akışları için MIDI ve zaman çizelgesi farkındalığını merkeze alan deterministik besteleme ortamı.',
        'A deterministic composition environment centred on MIDI and timeline awareness for reproducible music workflows.',
      ),
      year: 2026,
      context: localized('Kişisel çalışma', 'Personal work'),
      technologies: ['Python', 'mido', 'music21', 'simpleaudio', 'Paperclip'],
      topics: ['music', 'midi', 'creative-workflows'],
      cover: {
        slug: 'beatforge',
        palette: ['#0b1020', '#22d3ee', '#f59e0b'],
        visualVariant: 'signal-field',
        alt: localized('BeatForge MIDI zaman çizelgesi', 'BeatForge MIDI timeline'),
      },
      media: [],
      links: [],
      metrics: [],
      blocks: [
        {
          id: 'beatforge-principle',
          type: 'text',
          eyebrow: localized('İlke', 'Principle'),
          heading: localized('Aynı girdiden izlenebilir bir akış', 'A traceable flow from the same input'),
          body: localized(
            'BeatForge, beat besteleme ve aranjman kararlarını deterministik bir yapıda tutmayı araştırıyor. MIDI odaklı yaklaşım, kompozisyonun zaman çizelgesi üzerindeki parçalarını açık biçimde temsil ediyor.',
            'BeatForge explores keeping beat composition and arrangement decisions deterministic. Its MIDI-led approach represents the parts of a composition explicitly across a timeline.',
          ),
        },
        {
          id: 'beatforge-workspace',
          type: 'text',
          eyebrow: localized('Çalışma alanı', 'Workspace'),
          heading: localized('Bölüm farkındalığı olan zaman çizelgesi', 'A section-aware timeline'),
          body: localized(
            'Python çekirdeği mido ve music21 ile MIDI üretimini ve müzikal yapıyı işler; simpleaudio hızlı dinleme katmanını destekler. Zaman çizelgesi bölümleri aranjman kararlarını açık tutarken Paperclip iş akışları üretim adımlarını düzenler.',
            'The Python core uses mido and music21 for MIDI generation and musical structure, with simpleaudio supporting quick playback. Timeline sections keep arrangement decisions explicit, while Paperclip workflows organise production steps.',
          ),
        },
        {
          id: 'beatforge-facts',
          type: 'facts',
          heading: localized('Proje profili', 'Project profile'),
          items: [
            {
              label: localized('Temel veri', 'Core data'),
              value: localized('MIDI', 'MIDI'),
            },
            {
              label: localized('Yaklaşım', 'Approach'),
              value: localized('Deterministik kompozisyon', 'Deterministic composition'),
            },
          ],
        },
      ],
      relatedSlugs: ['draw-or-die', 'peakactivity'],
      seo: {
        title: localized(
          'BeatForge — Deterministik MIDI Çalışma Alanı',
          'BeatForge — Deterministic MIDI Workspace',
        ),
        description: localized(
          'Python, mido, music21 ve simpleaudio ile geliştirilen; bölüm farkındalıklı zaman çizelgesi ve Paperclip iş akışları sunan MIDI-first besteleme ortamı.',
          'A MIDI-first composition environment using Python, mido, music21, and simpleaudio, with a section-aware timeline and Paperclip workflows.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'peakactivity',
      status: 'published',
      discipline: 'software',
      format: 'product',
      order: 40,
      featured: true,
      title: localized('PeakActivity', 'PeakActivity'),
      dek: localized(
        'ActivityWatch verisini üretkenlik ve dijital sağlık bağlamında yorumlamak için masaüstü, web ve bulut katmanlarını birleştiren platform.',
        'A platform combining desktop, web, and cloud layers to interpret ActivityWatch data through productivity and digital wellbeing.',
      ),
      year: 2026,
      context: localized('Kişisel çalışma', 'Personal work'),
      technologies: [
        'Tauri',
        'Vue 3',
        'TypeScript',
        'Python',
        'Cloud Functions',
        'Firestore',
        'Firebase Auth',
      ],
      topics: ['productivity', 'digital-wellbeing', 'activity-data'],
      cover: {
        slug: 'peakactivity',
        palette: ['#07111f', '#38bdf8', '#a3e635'],
        visualVariant: 'product-orbit',
        alt: localized('PeakActivity etkinlik verisi görünümü', 'PeakActivity activity data view'),
      },
      media: [],
      links: [
        {
          kind: 'source',
          label: localized('GitHub reposu', 'GitHub repository'),
          href: 'https://github.com/ahmetcemkaraca/PeakActivity',
          newTab: true,
        },
      ],
      metrics: [],
      blocks: [
        {
          id: 'peakactivity-question',
          type: 'text',
          eyebrow: localized('Soru', 'Question'),
          heading: localized('Ham etkinlik verisi nasıl okunur?', 'How should raw activity data be read?'),
          body: localized(
            'PeakActivity, ActivityWatch tabanlı veriyi tek başına bir süre kaydı olarak bırakmak yerine üretkenlik ve dijital sağlık bağlamında anlamlandıran bir ürün yapısını araştırıyor.',
            'PeakActivity explores a product structure that interprets ActivityWatch-based data through productivity and digital wellbeing instead of leaving it as a raw duration log.',
          ),
        },
        {
          id: 'peakactivity-layers',
          type: 'text',
          eyebrow: localized('Katmanlar', 'Layers'),
          heading: localized('Masaüstünden buluta uzanan sistem', 'A system spanning desktop to cloud'),
          body: localized(
            'Tauri, Vue 3 ve TypeScript masaüstü ve web deneyimini aynı ürün çerçevesinde topluyor. Python tabanlı Cloud Functions veri işleme katmanını, Firestore kalıcı veriyi, Firebase Auth ise kullanıcı kimliğini destekliyor.',
            'Tauri, Vue 3, and TypeScript bring the desktop and web experiences into one product frame. Python-based Cloud Functions support data processing, Firestore stores product data, and Firebase Auth handles user identity.',
          ),
        },
        {
          id: 'peakactivity-facts',
          type: 'facts',
          heading: localized('Proje profili', 'Project profile'),
          items: [
            {
              label: localized('Veri kaynağı', 'Data source'),
              value: localized('ActivityWatch', 'ActivityWatch'),
            },
            {
              label: localized('Ürün alanı', 'Product area'),
              value: localized('Üretkenlik ve dijital sağlık', 'Productivity and digital wellbeing'),
            },
          ],
        },
      ],
      relatedSlugs: ['mailcrush', 'beatforge'],
      seo: {
        title: localized(
          'PeakActivity — Üretkenlik ve Dijital Sağlık',
          'PeakActivity — Productivity and Digital Wellbeing',
        ),
        description: localized(
          'ActivityWatch verisini Tauri, Vue 3, TypeScript, Python Cloud Functions, Firestore ve Firebase Auth ile yorumlayan dijital sağlık platformu.',
          'A digital wellbeing platform interpreting ActivityWatch data with Tauri, Vue 3, TypeScript, Python Cloud Functions, Firestore, and Firebase Auth.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'hocapuanla',
      status: 'published',
      discipline: 'software',
      format: 'product',
      order: 50,
      featured: true,
      title: localized('HocaPuanla', 'HocaPuanla'),
      dek: localized(
        'Anonim değerlendirme, arama, profil, karşılaştırma ve moderasyon akışlarını birleştiren öğretim elemanı keşif platformu.',
        'A professor discovery platform combining anonymous reviews, search, profiles, comparison, and moderation.',
      ),
      year: 2026,
      context: localized('Kişisel çalışma', 'Personal work'),
      technologies: [
        'Next.js 16',
        'React 19',
        'TypeScript',
        'Tailwind CSS 4',
        'shadcn/ui',
        'Radix UI',
        'Firebase',
        'Upstash',
      ],
      topics: ['education', 'search', 'moderation'],
      cover: {
        slug: 'hocapuanla',
        palette: ['#111827', '#f8fafc', '#10b981'],
        visualVariant: 'product-orbit',
        alt: localized('HocaPuanla arama ve profil yüzeyi', 'HocaPuanla search and profile surface'),
      },
      media: [],
      links: [],
      metrics: [],
      blocks: [
        {
          id: 'hocapuanla-scope',
          type: 'text',
          eyebrow: localized('Kapsam', 'Scope'),
          heading: localized('Arama, profil ve anonim geri bildirim', 'Search, profiles, and anonymous feedback'),
          body: localized(
            'HocaPuanla; öğretim elemanı arama, profil inceleme, anonim değerlendirme ve karşılaştırma akışlarını tek bir keşif deneyiminde bir araya getiriyor. Kullanıcılar kendi değerlendirmelerini PIN ile yönetebiliyor.',
            'HocaPuanla brings professor search, profile exploration, anonymous reviews, and comparison into one discovery experience. Users can manage their own reviews with a PIN.',
          ),
        },
        {
          id: 'hocapuanla-moderation',
          type: 'text',
          eyebrow: localized('Sistem', 'System'),
          heading: localized('Moderasyonu ürünün parçası olarak ele almak', 'Treating moderation as part of the product'),
          body: localized(
            'Next.js 16, React 19 ve TypeScript ürün yüzeyini; Tailwind CSS 4 ile shadcn/ui ve Radix UI bileşen sistemini kuruyor. Firebase veri ve moderasyon katmanlarını destekliyor; Upstash ise README’de isteğe bağlı altyapı bileşeni olarak tanımlanıyor.',
            'Next.js 16, React 19, and TypeScript form the product surface, with Tailwind CSS 4, shadcn/ui, and Radix UI providing the component system. Firebase supports data and moderation, while the README identifies Upstash as optional infrastructure.',
          ),
        },
        {
          id: 'hocapuanla-facts',
          type: 'facts',
          heading: localized('Proje profili', 'Project profile'),
          items: [
            {
              label: localized('Ana akış', 'Primary flow'),
              value: localized('Arama, değerlendirme ve karşılaştırma', 'Search, reviews, and comparison'),
            },
            {
              label: localized('Destekleyici katman', 'Supporting layer'),
              value: localized('PIN yönetimi ve moderasyon', 'PIN management and moderation'),
            },
          ],
        },
      ],
      relatedSlugs: ['mailcrush', 'archbuilder'],
      seo: {
        title: localized(
          'HocaPuanla — Eğitmen Keşif Platformu',
          'HocaPuanla — Instructor Discovery Platform',
        ),
        description: localized(
          'Arama, profil, anonim değerlendirme, PIN yönetimi, karşılaştırma ve moderasyon akışlarını birleştiren Next.js 16 ürünü.',
          'A Next.js 16 product combining search, profiles, anonymous reviews, PIN-based review management, comparison, and moderation.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'archbuilder',
      status: 'published',
      discipline: 'hybrid',
      format: 'product',
      order: 20,
      featured: true,
      title: localized('ArchBuilder', 'ArchBuilder'),
      dek: localized(
        'Soru-cevap akışıyla mimari konsept, program ve sunum verilerini düzenleyen yapay zekâ destekli web platformu.',
        'An AI-assisted web platform that structures architectural concept, programme, and presentation data through a guided dialogue.',
      ),
      context: localized('Mimarlık ve yazılım ürünü', 'Architecture and software product'),
      releaseStage: 'live',
      technologies: ['TypeScript', 'AI Workflow', 'Firebase'],
      topics: ['architecture', 'ai', 'workflow'],
      cover: {
        slug: 'archbuilder',
        palette: ['#101828', '#f2efe7', '#197fe6'],
        visualVariant: 'architectural-grid',
        alt: localized('ArchBuilder mimari üretim akışı', 'ArchBuilder architectural workflow'),
      },
      media: [],
      links: [
        {
          kind: 'live',
          label: localized('ArchBuilder’ı aç', 'Open ArchBuilder'),
          href: 'https://archbuilder.app',
          newTab: true,
        },
      ],
      metrics: [],
      blocks: [
        {
          id: 'archbuilder-brief',
          type: 'text',
          eyebrow: localized('Ürün fikri', 'Product idea'),
          heading: localized('Dağınık brief’i yönlendirilmiş diyaloğa çevirmek', 'Turning a fragmented brief into guided dialogue'),
          body: localized(
            'ArchBuilder, mimari proje üretiminde gereken başlangıç bilgisini soru-cevap akışıyla toplar. Konsept, program ve sunum verilerini aynı süreç içinde düzenlemeyi hedefler.',
            'ArchBuilder gathers the initial information required for architectural project development through a guided dialogue. It aims to organise concept, programme, and presentation data within the same process.',
          ),
        },
        {
          id: 'archbuilder-bridge',
          type: 'text',
          eyebrow: localized('Kesişim', 'Intersection'),
          heading: localized('Mimari düşünce ile ürün akışının birleşimi', 'Where architectural thinking meets product flow'),
          body: localized(
            'Proje, mimari kararların sıralanışını bir yazılım akışına çevirir. TypeScript ürün yüzeyini, yapay zekâ iş akışı yönlendirmeyi, Firebase ise uygulama altyapısını destekler.',
            'The project translates the sequence of architectural decisions into a software flow. TypeScript supports the product surface, the AI workflow supports guidance, and Firebase supports the application infrastructure.',
          ),
        },
        {
          id: 'archbuilder-facts',
          type: 'facts',
          heading: localized('Proje profili', 'Project profile'),
          items: [
            {
              label: localized('Platform', 'Platform'),
              value: localized('Web platformu', 'Web platform'),
            },
            {
              label: localized('Girdi yapısı', 'Input structure'),
              value: localized('Yönlendirilmiş soru-cevap', 'Guided question and answer'),
            },
          ],
        },
      ],
      relatedSlugs: ['draw-or-die', 'hocapuanla'],
      seo: {
        title: localized(
          'ArchBuilder — Yapay Zekâ Destekli Mimari Akış',
          'ArchBuilder — AI-Assisted Architectural Workflow',
        ),
        description: localized(
          'Mimari konsept, program ve sunum verilerini yönlendirilmiş soru-cevap akışıyla düzenleyen TypeScript ve Firebase tabanlı platform.',
          'A TypeScript and Firebase platform structuring architectural concept, programme, and presentation data through guided dialogue.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'duaapp',
      status: 'published',
      discipline: 'software',
      format: 'product',
      order: 70,
      featured: false,
      title: localized('DuaAPP', 'DuaAPP'),
      dek: localized(
        'Beş inanç geleneğinden dua ve kutsal metinleri günlük pratik araçları ve yapay zekâ rehberliğiyle birleştiren mobil manevi yol arkadaşı.',
        'A mobile spiritual companion combining prayers and sacred texts from five traditions with daily practice tools and AI guidance.',
      ),
      releaseStage: 'maintained',
      technologies: [
        'Flutter',
        'Dart',
        'Riverpod',
        'GoRouter',
        'Appwrite Functions',
        'Appwrite Database',
        'Appwrite Auth',
      ],
      topics: ['mobile', 'spiritual-practice', 'multi-tradition'],
      cover: {
        slug: 'duaapp',
        palette: ['#0f172a', '#f7f3e8', '#a78bfa'],
        visualVariant: 'spatial-gradient',
        alt: localized('DuaAPP manevi pratik akışı', 'DuaAPP spiritual practice flow'),
      },
      media: [],
      links: [
        {
          kind: 'updates',
          label: localized('DuaAPP güncellemeleri', 'DuaAPP updates'),
          href: '/dua/news',
          newTab: false,
        },
      ],
      metrics: [],
      blocks: [
        {
          id: 'duaapp-content',
          type: 'text',
          eyebrow: localized('İçerik deneyimi', 'Content experience'),
          heading: localized('Birden fazla geleneği tek deneyimde sunmak', 'Bringing multiple traditions into one experience'),
          body: localized(
            'DuaAPP; İslam, Hristiyanlık, Yahudilik, Budizm ve Hinduizm gelenekleri için dua koleksiyonları ve kutsal kitap erişimi sunuyor. Dua sayacı, yapay zekâ rehberliği ve rüya günlüğü günlük manevi pratiği destekleyen ayrı araçlar olarak aynı uygulamada buluşuyor.',
            'DuaAPP provides prayer collections and access to sacred texts across Islam, Christianity, Judaism, Buddhism, and Hinduism. A prayer counter, AI guidance, and dream journal come together as distinct tools supporting daily spiritual practice.',
          ),
        },
        {
          id: 'duaapp-localization',
          type: 'text',
          eyebrow: localized('Sistem', 'System'),
          heading: localized('Mobil durum ve servis katmanlarını ayırmak', 'Separating mobile state and service layers'),
          body: localized(
            'Flutter uygulama yüzeyini, Riverpod durum yönetimini, GoRouter gezinmeyi kuruyor. Appwrite Functions, Database ve Auth ise sunucu işlevlerini, içeriği ve kullanıcı kimliğini destekleyen arka uç katmanlarını oluşturuyor.',
            'Flutter forms the application surface, Riverpod handles state, and GoRouter handles navigation. Appwrite Functions, Database, and Auth provide the backend layers for server logic, content, and user identity.',
          ),
        },
        {
          id: 'duaapp-facts',
          type: 'facts',
          heading: localized('Proje profili', 'Project profile'),
          items: [
            {
              label: localized('README sürümü', 'README version'),
              value: localized('Kararlı v1.2.8', 'Stable v1.2.8'),
            },
            {
              label: localized('İçerik kapsamı', 'Content scope'),
              value: localized('Beş inanç geleneği', 'Five faith traditions'),
            },
          ],
        },
      ],
      relatedSlugs: ['where-to-go', 'archbuilder'],
      seo: {
        title: localized(
          'DuaAPP — Çok Gelenekli Manevi Yol Arkadaşı',
          'DuaAPP — Multi-Tradition Spiritual Companion',
        ),
        description: localized(
          'Beş inanç geleneği için dua, sayaç, yapay zekâ rehberliği, rüya günlüğü ve kutsal metinleri birleştiren Flutter ve Appwrite uygulaması.',
          'A Flutter and Appwrite companion combining prayers, a counter, AI guidance, dream journaling, and sacred texts across five faith traditions.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'where-to-go',
      status: 'published',
      discipline: 'software',
      format: 'product',
      order: 80,
      featured: false,
      title: localized('Where To-Go', 'Where To-Go'),
      dek: localized(
        'Çiftlerin veya iki kişilik grupların mekânları kaydırarak değerlendirdiği ve karşılıklı seçimde eşleştiği gerçek zamanlı keşif uygulaması.',
        'A real-time discovery app where couples or two-person groups swipe through places and match when both choose the same option.',
      ),
      releaseStage: 'in-development',
      technologies: [
        'Flutter',
        'Dart',
        'Riverpod',
        'Firebase',
        'Google Maps',
        'Google Places',
        'Deep Links',
      ],
      topics: ['mobile', 'place-discovery', 'realtime-sessions'],
      cover: {
        slug: 'where-to-go',
        palette: ['#102a43', '#f0f4f8', '#2dd4bf'],
        visualVariant: 'product-orbit',
        alt: localized('Where To-Go harita ve keşif akışı', 'Where To-Go map and discovery flow'),
      },
      media: [],
      links: [
        {
          kind: 'updates',
          label: localized('Proje notları', 'Project notes'),
          href: '/wheretogo/news',
          newTab: false,
        },
        {
          kind: 'privacy',
          label: localized('Gizlilik politikası', 'Privacy policy'),
          href: '/wheretogo/privacy',
          newTab: false,
        },
        {
          kind: 'terms',
          label: localized('Kullanım koşulları', 'Terms of use'),
          href: '/wheretogo/terms',
          newTab: false,
        },
      ],
      metrics: [],
      blocks: [
        {
          id: 'where-to-go-discovery',
          type: 'text',
          eyebrow: localized('Ürün fikri', 'Product idea'),
          heading: localized('İki kişinin seçimlerini ortak karara çevirmek', 'Turning two preferences into one decision'),
          body: localized(
            'Where To-Go, çiftler veya iki kişilik gruplar için Tinder benzeri bir mekân keşif akışı kuruyor. Google Places seçenekleri kaydırma arayüzünde sunuluyor; iki katılımcının da aynı yeri seçmesi ortak bir eşleşme üretiyor.',
            'Where To-Go creates a Tinder-style place discovery flow for couples or two-person groups. Google Places options appear in a swipe interface, and a shared match is created when both participants choose the same place.',
          ),
        },
        {
          id: 'where-to-go-session',
          type: 'text',
          eyebrow: localized('Oturum', 'Session'),
          heading: localized('Gerçek zamanlı katılım ve derin bağlantılar', 'Real-time participation and deep links'),
          body: localized(
            'Firebase gerçek zamanlı iki kişilik oturumu ve karşılıklı eşleşme durumunu destekliyor; derin bağlantılar ikinci katılımcının doğru oturuma katılmasını sağlıyor. Flutter ve Riverpod mobil ürün yüzeyi ile durum akışını kuruyor.',
            'Firebase supports the real-time two-person session and mutual match state, while deep links bring the second participant into the correct session. Flutter and Riverpod form the mobile product surface and state flow.',
          ),
        },
        {
          id: 'where-to-go-facts',
          type: 'facts',
          heading: localized('Proje profili', 'Project profile'),
          items: [
            {
              label: localized('Platform', 'Platform'),
              value: localized('iOS ve Android', 'iOS and Android'),
            },
            {
              label: localized('Geliştirme durumu', 'Development status'),
              value: localized('V1 sorunları belgeli; yeniden yapım planlı', 'V1 issues documented; full rebuild planned'),
            },
          ],
        },
      ],
      relatedSlugs: ['duaapp', 'peakactivity'],
      seo: {
        title: localized(
          'Where To-Go — İki Kişilik Mekân Keşfi',
          'Where To-Go — Place Discovery for Two',
        ),
        description: localized(
          'Flutter, Riverpod, Firebase ve Google Places ile gerçek zamanlı oturum, karşılıklı eşleşme ve derin bağlantı sunan iki kişilik keşif uygulaması.',
          'A two-person discovery app using Flutter, Riverpod, Firebase, and Google Places for real-time sessions, mutual matches, and deep links.',
        ),
        noIndex: false,
      },
    },
  ],
  journal: [
    {
      slug: 'mekan-ve-arayuz-arasinda',
      entryType: 'journal',
      status: 'published',
      order: 10,
      publishedAt: '2026-08-04T08:00:00.000Z',
      title: localized(
        'Mekân ve arayüz arasında çalışmak',
        'Working between space and interface',
      ),
      excerpt: localized(
        'Mimari düşünce ile ürün geliştirme pratiğinin aynı portfolyoda nasıl birbirini besleyebileceğine dair editoryal bir giriş.',
        'An editorial introduction to how architectural thinking and product development can reinforce each other in one portfolio.',
      ),
      topics: ['architecture', 'software', 'practice'],
      cover: {
        slug: 'mekan-ve-arayuz-arasinda',
        palette: ['#ede9df', '#121417', '#197fe6'],
        visualVariant: 'editorial-collage',
        alt: localized('Mekân ve arayüz eskizleri', 'Sketches of space and interface'),
      },
      blocks: [
        {
          id: 'mekan-arayuz-notu',
          type: 'text',
          heading: localized('İki ayrı alan değil, iki ayrı ölçek', 'Not two fields, but two scales'),
          body: localized(
            'Mimarlık; bağlamı, sınırları ve insan hareketini okumayı öğretir. Yazılım ise aynı kararları durumlar, geri bildirimler ve tekrar eden akışlar üzerinden sınar. İki pratik, bu çalışma yönteminde aynı karar verme disiplininin farklı ölçekleri olarak buluşur.',
            'Architecture teaches how to read context, constraints, and human movement. Software tests similar decisions through states, feedback, and repeated flows. In this practice, both become different scales of the same decision-making discipline.',
          ),
        },
      ],
      linkedProjectSlugs: ['archbuilder', 'draw-or-die'],
      seo: {
        title: localized(
          'Mekân ve Arayüz Arasında Çalışmak',
          'Working Between Space and Interface',
        ),
        description: localized(
          'Mimari düşünce ile yazılım ve ürün geliştirme pratiğinin aynı üretim yöntemi içinde nasıl buluştuğuna dair yazı.',
          'An essay on how architectural thinking meets software and product development within one way of making.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'paftadan-qr-katmanina',
      entryType: 'lab-note',
      status: 'published',
      order: 20,
      publishedAt: '2026-08-03T08:00:00.000Z',
      title: localized(
        'Paftadan QR katmanına',
        'From presentation board to QR layer',
      ),
      excerpt: localized(
        'Fiziksel bir mimari paftayı QR kod, yakınlaştırılabilir görsel ve ek proje bilgisiyle genişletme fikri üzerine laboratuvar notu.',
        'A lab note on extending a physical architecture board with a QR code, zoomable media, and additional project context.',
      ),
      topics: ['architecture', 'qr', 'presentation'],
      cover: {
        slug: 'paftadan-qr-katmanina',
        palette: ['#111921', '#e2e8f0', '#22c55e'],
        visualVariant: 'architectural-grid',
        alt: localized('Pafta ve QR kod katmanı', 'Presentation board and QR layer'),
      },
      blocks: [
        {
          id: 'pafta-qr-kapsam',
          type: 'text',
          heading: localized('Fiziksel teslimin dijital devamı', 'A digital continuation of physical presentation'),
          body: localized(
            'Repo, paftalar için QR kod oluşturma ve okutulduğunda proje görseline ulaşma akışını içeriyor. İndirme, paylaşma ve yakınlaştırma gibi araçlar fiziksel sunumu kesintisiz bir dijital devamla tamamlıyor.',
            'The repository includes a flow for generating QR codes for presentation boards and opening project media after scanning. Download, sharing, and zoom tools extend the physical presentation into a continuous digital layer.',
          ),
        },
      ],
      linkedProjectSlugs: [],
      seo: {
        title: localized(
          'Paftadan QR Katmanına — Laboratuvar Notu',
          'From Board to QR Layer — Lab Note',
        ),
        description: localized(
          'Mimari paftalar için QR kod, yakınlaştırılabilir görsel ve dijital proje bilgisi akışını ele alan laboratuvar notu.',
          'A lab note about QR codes, zoomable media, and digital project context for architectural presentation boards.',
        ),
        noIndex: false,
      },
    },
  ],
};

const generatedSnapshot = generatedContent as unknown;
const hasGeneratedSnapshot = generatedSnapshot !== null
  && typeof generatedSnapshot === 'object'
  && 'settings' in generatedSnapshot
  && 'projects' in generatedSnapshot
  && 'journal' in generatedSnapshot;

export const fallbackContentBundle: ContentBundle = parseContentBundle(fallbackBundle);
const bundle: ContentBundle = hasGeneratedSnapshot
  ? parseContentBundle(generatedSnapshot)
  : fallbackContentBundle;

export const portfolioProjects: PortfolioProject[] = bundle.projects;
export const siteSettings: SiteSettings = bundle.settings;
export const allEntries: JournalEntry[] = bundle.journal;
export const journalEntries: JournalEntry[] = allEntries.filter(
  (entry) => entry.entryType === 'journal',
);
export const labEntries: JournalEntry[] = allEntries.filter(
  (entry) => entry.entryType === 'lab-note',
);
export const contentBundle: ContentBundle = bundle;

export const findPortfolioProject = (slug: string): PortfolioProject | undefined =>
  portfolioProjects.find((project) => project.slug === slug);

export const findJournalEntry = (slug: string): JournalEntry | undefined =>
  allEntries.find((entry) => entry.slug === slug);
