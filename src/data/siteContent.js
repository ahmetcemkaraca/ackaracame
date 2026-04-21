export const projects = [
  {
    id: 'draw-or-die',
    title: 'Draw Or Die',
    description: 'Cizim ve eskiz tabanli, hizli karar verme odakli deneysel bir TypeScript projesi. Fikir uretimi, sunum ve gorsel karar akislarini tek ekranda toplar.',
    category: 'yazilim',
    images: [
      'https://placehold.co/1600x1000/0f172a/f8fafc?text=Draw+Or+Die',
      'https://placehold.co/1200x900/111827/e2e8f0?text=Concept',
      'https://placehold.co/1200x900/1f2937/e5e7eb?text=Iteration'
    ],
    technologies: ['TypeScript', 'Canvas API', 'Framer Motion'],
    year: '2026',
    semester: 'Personal',
    featured: true,
    order: 1,
    status: 'active',
    location: 'Antalya, TR'
  },
  {
    id: 'mailcrush',
    title: 'MailCrush',
    description: 'AI destekli e-posta ozetleme ve digester servisi. Inbound email, OpenAI tabanli kisa ozetler, Stripe abonelik yapisi ve Firebase auth ile calisir.',
    category: 'yazilim',
    images: [
      'https://placehold.co/1600x1000/0f172a/f8fafc?text=MailCrush',
      'https://placehold.co/1200x900/111827/e2e8f0?text=Email+Digest',
      'https://placehold.co/1200x900/1f2937/e5e7eb?text=FastAPI+%2B+Next.js'
    ],
    technologies: ['Next.js', 'FastAPI', 'OpenAI', 'Firebase', 'Stripe'],
    year: '2026',
    semester: 'Personal',
    featured: true,
    order: 3,
    status: 'active',
    location: 'Remote',
    link: 'https://github.com/ahmetcemkaraca/MailCrush',
    linkText: 'GitHub Repo'
  },
  {
    id: 'beatforge',
    title: 'BeatForge',
    description: 'Deterministik beat besteleme ve aranjman ortami. MIDI odakli yapisi ile tekrar uretilabilir muzik akislari ve timeline farkindaligi saglar.',
    category: 'yazilim',
    images: [
      'https://placehold.co/1600x1000/0f172a/f8fafc?text=BeatForge',
      'https://placehold.co/1200x900/111827/e2e8f0?text=MIDI+Workflow',
      'https://placehold.co/1200x900/1f2937/e5e7eb?text=Python+Workspace'
    ],
    technologies: ['Python', 'MIDI', 'music21', 'TypeScript', 'Vite'],
    year: '2026',
    semester: 'Personal',
    featured: false,
    order: 4,
    status: 'active',
    location: 'Remote',
    link: 'https://github.com/ahmetcemkaraca/beatforge',
    linkText: 'GitHub Repo'
  },
  {
    id: 'peakactivity',
    title: 'PeakActivity',
    description: 'ActivityWatch tabanli veriyi AI ile anlamli icgorlugu donusturen uretkenlik ve dijital saglik platformu. Desktop, web panel ve cloud functions katmanlari var.',
    category: 'yazilim',
    images: [
      'https://placehold.co/1600x1000/0f172a/f8fafc?text=PeakActivity',
      'https://placehold.co/1200x900/111827/e2e8f0?text=ActivityWatch+Core',
      'https://placehold.co/1200x900/1f2937/e5e7eb?text=Firebase+Analytics'
    ],
    technologies: ['Tauri', 'Vue.js', 'TypeScript', 'Firebase', 'Python'],
    year: '2026',
    semester: 'Personal',
    featured: true,
    order: 5,
    status: 'active',
    location: 'Remote',
    link: 'https://github.com/ahmetcemkaraca/PeakActivity',
    linkText: 'GitHub Repo'
  },
  {
    id: 'hocapuanla',
    title: 'HocaPuanla',
    description: 'Anonim hoca degerlendirme ve kesif platformu. Arama, profil sayfasi, yonetim akislari ve Firebase tabanli moderasyon katmanlari barindirir.',
    category: 'yazilim',
    images: [
      'https://placehold.co/1600x1000/0f172a/f8fafc?text=HocaPuanla',
      'https://placehold.co/1200x900/111827/e2e8f0?text=Professor+Search',
      'https://placehold.co/1200x900/1f2937/e5e7eb?text=Next.js+16'
    ],
    technologies: ['Next.js', 'React', 'TypeScript', 'Firebase', 'Playwright'],
    year: '2026',
    semester: 'Personal',
    featured: true,
    order: 6,
    status: 'active',
    location: 'Remote',
    link: 'https://github.com/ahmetcemkaraca/hocapuanla',
    linkText: 'GitHub Repo'
  }
];

export const applications = [
  {
    id: 'archbuilder',
    title: 'ArchBuilder',
    version: 'v1.0.0 • Live',
    type: 'Web Platform',
    kind: 'application',
    iconName: 'Monitor',
    image: 'https://placehold.co/1600x900/0f172a/f8fafc?text=ArchBuilder',
    description: 'Yapay zeka destekli mimari proje olusturma platformu. Kullaniciyi soru-cevap akisiyla yonlendirerek konsept, program ve sunum verilerini duzenler.',
    techStack: [
      { name: 'TypeScript', color: 'bg-cyan-400' },
      { name: 'AI Workflow', color: 'bg-green-500' },
      { name: 'Firebase', color: 'bg-yellow-400' }
    ],
    link: 'https://archbuilder.app',
    linkText: 'Uygulamaya Git',
    accountDeletionEnabled: true
  },
  {
    id: 'duaapp',
    title: 'DuaAPP',
    version: 'v2.1.0 • Mobile',
    type: 'iOS / Android',
    kind: 'application',
    iconName: 'Smartphone',
    image: 'https://placehold.co/1600x900/0f172a/f8fafc?text=DuaAPP',
    description: 'Gunluk dualar, kategorilere ayrilmis icerikler ve cok dilli kullanim akislarina sahip mobil deneyim. Manevi icerik odakli hafif bir urun dili kullanir.',
    techStack: [
      { name: 'Dart', color: 'bg-blue-500' },
      { name: 'Firebase', color: 'bg-orange-500' },
      { name: 'Localization', color: 'bg-purple-500' }
    ],
    link: '/dua/news',
    linkText: 'Guncellemeler',
    accountDeletionEnabled: true
  },
  {
    id: 'where-to-go',
    title: 'Where To-Go',
    version: 'v1.0.0 • Mobile',
    type: 'iOS / Android',
    kind: 'application',
    iconName: 'Globe',
    image: 'https://placehold.co/1600x900/0f172a/f8fafc?text=Where+To-Go',
    description: 'Aile odakli konum ve etkinlik kesfi icin tasarlanmis mobil urun. Guvenli rota onerileri, ilgi alani filtreleri ve cocuk guvenligi duyarli karar destegi saglar.',
    techStack: [
      { name: 'React Native', color: 'bg-blue-500' },
      { name: 'Maps API', color: 'bg-green-500' },
      { name: 'Firebase', color: 'bg-orange-500' }
    ],
    link: '/wheretogo/news',
    linkText: 'Proje Notlari',
    accountDeletionEnabled: true
  }
];

export const findProjectById = (id) => projects.find((project) => project.id === id) || null;
export const findApplicationById = (id) => applications.find((application) => application.id === id) || null;
