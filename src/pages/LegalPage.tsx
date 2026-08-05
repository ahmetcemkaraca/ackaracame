import { ArrowLeft, ExternalLink, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { useAppPreferences } from '../context/AppPreferences';
import { useContent } from '../context/Content';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useLocaleHref } from '../hooks/useLocaleHref';

export type LegalPageKind = 'privacy' | 'terms' | 'account-deletion' | 'wheretogo-privacy' | 'wheretogo-terms' | 'wheretogo-csam' | 'dua-news' | 'wheretogo-news';

type LocalizedText = { tr: string; en: string };
type LegalSection = { heading: LocalizedText; paragraphs: LocalizedText[]; items?: LocalizedText[] };

const localized = (tr: string, en: string): LocalizedText => ({ tr, en });

const policies: Record<LegalPageKind, { eyebrow: LocalizedText; title: LocalizedText; intro: LocalizedText; updated: boolean; sections: LegalSection[] }> = {
  privacy: {
    eyebrow: localized('Yasal / web sitesi', 'Legal / website'),
    title: localized('Gizlilik politikası', 'Privacy policy'),
    intro: localized('Bu politika, ACKaraca.me üzerinden hangi verilerin neden işlendiğini ve haklarınızı açıklar.', 'This policy explains what data is processed through ACKaraca.me, why it is processed, and your rights.'),
    updated: true,
    sections: [
      {
        heading: localized('Topladığımız bilgiler', 'Information we collect'),
        paragraphs: [localized('Siteyi yalnızca gezdiğinizde doğrudan kimlik bilgisi istemeyiz. İletişim formunu kullandığınızda adınız, e-posta adresiniz, isteğe bağlı şirket ve proje bağlamı ile mesajınız işlenir.', 'We do not ask for direct identity information when you simply browse the site. If you use the contact form, we process your name, email address, optional company and project context, and your message.')],
        items: [
          localized('Güvenlik ve hız sınırlama amacıyla kısa süreli, tek yönlü ağ tanımlayıcıları.', 'Short-lived, one-way network identifiers for security and rate limiting.'),
          localized('Tercih ettiğiniz dil, tema ve hareket ayarları; yalnızca cihazınızdaki yerel depolamada.', 'Your language, theme, and motion preferences, stored only in local storage on your device.'),
          localized('Mesaja yanıt vermek için gönderdiğiniz iletişim ve proje bilgileri.', 'Contact and project information you submit so we can respond to your message.'),
        ],
      },
      {
        heading: localized('Amaç, hukuki dayanak ve saklama', 'Purpose, legal basis, and retention'),
        paragraphs: [
          localized('Bilgiler yalnızca talebinize yanıt vermek, hizmeti kötüye kullanımdan korumak ve gerekli kayıtları tutmak için kullanılır. İletişim verisi rızanıza ve talebiniz üzerine sözleşme öncesi adımlara dayanır; güvenlik işlemleri meşru menfaate dayanır.', 'Information is used only to respond to your request, protect the service from abuse, and retain necessary records. Contact data is processed on the basis of your consent and pre-contractual steps at your request; security processing relies on legitimate interests.'),
          localized('Mesajlar, görüşme aktif olduğu ve makul bir takip süresi boyunca saklanır; artık gerekli olmayan kayıtlar silinir veya anonimleştirilir. Güvenlik sayaçları otomatik olarak kısa süre içinde sona erer.', 'Messages are retained while a conversation is active and for a reasonable follow-up period; records that are no longer needed are deleted or anonymised. Security counters expire automatically after a short period.'),
        ],
      },
      {
        heading: localized('Hizmet sağlayıcılar ve aktarım', 'Service providers and transfers'),
        paragraphs: [localized('Barındırma, kimlik doğrulama, veritabanı, dosya depolama ve sunucusuz işlevler için Google Firebase kullanılabilir. Bu sağlayıcı yalnızca hizmeti sunmak için gerekli veriyi işler ve kendi güvenlik ve veri işleme şartlarına tabidir.', 'Google Firebase may be used for hosting, authentication, database, file storage, and serverless functions. This provider processes only the data needed to deliver the service and is subject to its own security and data-processing terms.')],
      },
      {
        heading: localized('Haklarınız', 'Your rights'),
        paragraphs: [localized('Uygulanabilir mevzuata bağlı olarak erişim, düzeltme, silme, kısıtlama, taşınabilirlik ve itiraz haklarına sahip olabilirsiniz. Ayrıca rızanızı ileriye dönük olarak geri çekebilir ve ilgili veri koruma otoritesine şikâyette bulunabilirsiniz.', 'Depending on applicable law, you may have rights of access, correction, deletion, restriction, portability, and objection. You may also withdraw consent for the future and lodge a complaint with the relevant data protection authority.')],
      },
    ],
  },
  terms: {
    eyebrow: localized('Yasal / web sitesi', 'Legal / website'),
    title: localized('Kullanım koşulları', 'Terms of use'),
    intro: localized('Bu koşullar ACKaraca.me portfolyosunun ve herkese açık içeriklerinin kullanımını düzenler.', 'These terms govern use of the ACKaraca.me portfolio and its public content.'),
    updated: true,
    sections: [
      {
        heading: localized('Kapsam', 'Scope'),
        paragraphs: [localized('Site, Ahmet Cem Karaca’nın seçili çalışmalarını ve mesleki yaklaşımını sunan bilgilendirme amaçlı bir portfolyodur. Buradaki hiçbir içerik bağlayıcı teklif, garanti veya mesleki danışmanlık oluşturmaz.', 'The site is an informational portfolio presenting selected work and the professional practice of Ahmet Cem Karaca. Nothing here constitutes a binding offer, warranty, or professional advice.')],
      },
      {
        heading: localized('Fikri mülkiyet', 'Intellectual property'),
        paragraphs: [localized('Aksi belirtilmedikçe metinler, görsel sistem, tasarım ve özgün proje anlatıları hak sahibine aittir. İçeriği kişisel inceleme ve bağlantı paylaşımı için kullanabilirsiniz; ticari çoğaltma, yeniden yayımlama veya yanıltıcı atıf için yazılı izin gerekir.', 'Unless otherwise stated, the text, visual system, design, and original project narratives belong to their rights holder. You may use the content for personal review and link sharing; commercial reproduction, republication, or misleading attribution requires written permission.')],
      },
      {
        heading: localized('Kabul edilebilir kullanım', 'Acceptable use'),
        paragraphs: [localized('Siteye zarar vermeye, yetkisiz alanlara erişmeye, hız sınırlarını aşmaya, kötü amaçlı içerik göndermeye veya başka bir kişinin kimliğine bürünmeye çalışamazsınız. Güvenliği korumak için kötüye kullanım engellenebilir ve gerekli kayıtlar tutulabilir.', 'You may not attempt to harm the site, access restricted areas, evade rate limits, submit malicious content, or impersonate another person. Abuse may be blocked and necessary records retained to protect the service.')],
      },
      {
        heading: localized('Harici bağlantılar ve sorumluluk', 'External links and liability'),
        paragraphs: [localized('Portfolyo, üçüncü taraf proje veya kaynaklara bağlantı verebilir. Bu hizmetlerin içeriği ve kullanılabilirliği kontrolümüz dışında olabilir. Site makul özenle sunulur ancak kesintisiz veya hatasız çalışma garantisi verilmez; kanunun izin verdiği ölçüde dolaylı kayıplardan sorumluluk kabul edilmez.', 'The portfolio may link to third-party projects or resources whose content and availability can be outside our control. The site is provided with reasonable care, but uninterrupted or error-free operation is not guaranteed; liability for indirect loss is excluded to the extent permitted by law.')],
      },
    ],
  },
  'account-deletion': {
    eyebrow: localized('Hesap ve veri', 'Account and data'),
    title: localized('Hesap silme talebi', 'Account deletion request'),
    intro: localized('ACKARACA ürünlerinden birindeki hesabınızı ve ilişkili verilerinizi silmek için aşağıdaki doğrulanabilir yolu kullanın.', 'Use the verifiable process below to delete your account and associated data from an ACKARACA product.'),
    updated: false,
    sections: [
      {
        heading: localized('Nasıl talep edilir?', 'How to request deletion'),
        paragraphs: [localized('Üründe “Ayarlar → Hesap → Hesabı sil” seçeneği varsa en hızlı yol budur. Bu seçenek görünmüyorsa hesabınızda kayıtlı e-posta adresinden aşağıdaki iletişim adresine “Hesap silme” konulu bir mesaj gönderin ve kullandığınız ürünün adını belirtin.', 'If the product offers “Settings → Account → Delete account”, that is the fastest route. If the option is unavailable, email the address below from the email registered to your account with the subject “Account deletion” and include the product name.')],
      },
      {
        heading: localized('Doğrulama ve sonuç', 'Verification and outcome'),
        paragraphs: [localized('Başka bir kişinin verisini silmemek için hesap sahipliğini doğrulamamız gerekebilir. Doğrulama tamamlandıktan sonra hesap ve ürüne doğrudan bağlı içerik silinir veya geri döndürülemez biçimde anonimleştirilir. Yasal yükümlülük, dolandırıcılık önleme veya uyuşmazlık çözümü için tutulması gereken sınırlı kayıtlar, gerekli süre sonunda silinir.', 'We may need to verify account ownership to avoid deleting another person’s data. Once verification is complete, the account and directly associated product content are deleted or irreversibly anonymised. Limited records required for legal obligations, fraud prevention, or dispute resolution are deleted after the necessary retention period.')],
      },
    ],
  },
  'wheretogo-privacy': {
    eyebrow: localized('WhereToGo / yasal', 'WhereToGo / legal'),
    title: localized('WhereToGo gizlilik politikası', 'WhereToGo privacy policy'),
    intro: localized('Bu politika, iki kişinin birlikte yer keşfetmesini sağlayan WhereToGo uygulamasında konum, hesap, oturum ve tercih verilerinin nasıl işlendiğini açıklar.', 'This policy explains how location, account, session, and preference data is processed in WhereToGo, an app for two people to discover places together.'),
    updated: true,
    sections: [
      {
        heading: localized('İşlenen veriler', 'Data we process'),
        paragraphs: [localized('WhereToGo, yalnızca etkinleştirdiğiniz özellikler için gerekli veriyi işler. Konum izni verdiğinizde yaklaşık veya hassas konumunuz, yakındaki yerleri göstermek ve harita sonucunu bağlama oturtmak için kullanılabilir. Konum iznini cihaz ayarlarından geri çekebilirsiniz.', 'WhereToGo processes only the data needed for features you choose to use. If you grant location permission, your approximate or precise location may be used to show nearby places and contextualise map results. You can withdraw location permission in your device settings.')],
        items: [
          localized('Hesap açtığınızda kullanıcı kimliği, e-posta ve sınırlı profil bilgileri.', 'User ID, email, and limited profile information when you create an account.'),
          localized('İki kişilik gerçek zamanlı oturum kodu, katılımcı durumu ve bağlantı zamanı.', 'Two-person real-time session code, participant state, and connection time.'),
          localized('Kaydırma tercihleri, atlanan veya beğenilen yerler ve karşılıklı eşleşmeler.', 'Swipe preferences, skipped or liked places, and mutual matches.'),
          localized('Hata ayıklama, kötüye kullanım önleme ve hizmet güvenliği için sınırlı teknik kayıtlar.', 'Limited technical records for troubleshooting, abuse prevention, and service security.'),
        ],
      },
      {
        heading: localized('Kullanım amaçları', 'How the data is used'),
        paragraphs: [localized('Veri; yakındaki yerleri sunmak, iki katılımcının oturumunu eşitlemek, karşılıklı eşleşmeyi hesaplamak, seçilen yeri harita uygulamasında açmak, hesabı güvenli tutmak ve teknik sorunları çözmek için kullanılır. Hassas konum veya tercih verisi reklam amacıyla satılmaz.', 'Data is used to present nearby places, synchronise a two-person session, calculate mutual matches, open a selected place in a maps app, secure the account, and resolve technical issues. Precise location and preference data is not sold for advertising.')],
      },
      {
        heading: localized('Sağlayıcılar ve paylaşım', 'Providers and sharing'),
        paragraphs: [localized('Firebase kimlik doğrulama, gerçek zamanlı oturum ve veri saklama katmanlarını; Google Places veya ilgili harita sağlayıcısı yer sonuçlarını ve harita yönlendirmesini destekleyebilir. Bir oturumdaki seçimler yalnızca oturumun çalışması için diğer katılımcının sonucu ile karşılaştırılır; tek taraflı tercihler karşı tarafa açık biçimde gösterilmez. Hukuken zorunlu olmadıkça kişisel veri üçüncü taraflara satılmaz.', 'Firebase may support authentication, real-time sessions, and data storage; Google Places or the relevant map provider may support place results and map directions. Choices in a session are compared with the other participant only to operate matching; one-sided preferences are not shown openly to the other participant. Personal data is not sold to third parties unless disclosure is legally required.')],
      },
      {
        heading: localized('Saklama, silme ve haklar', 'Retention, deletion, and your rights'),
        paragraphs: [localized('Geçici oturum verisi hizmet için gerekli olduğu süreyle sınırlı tutulur. Hesap, favori veya eşleşme kayıtları siz silene, hesabınızı kapatana veya artık gerekli olmayana kadar saklanabilir. Hesap silme bağlantısını veya aşağıdaki iletişim adresini kullanarak erişim, düzeltme ya da silme talebinde bulunabilirsiniz.', 'Temporary session data is limited to the period needed to operate the service. Account, favourite, or match records may remain until you delete them, close your account, or they are no longer necessary. Use the account-deletion link or the contact address below to request access, correction, or deletion.')],
      },
      {
        heading: localized('Çocuklar ve güvenlik', 'Children and safety'),
        paragraphs: [localized('WhereToGo çocuklara yönelik bir hizmet değildir. Çocukların cinsel istismarı veya sömürüsüyle ilgili içerik ve davranışlara karşı sıfır tolerans uygulanır; ayrıntılı güvenlik standardı kalıcı CSAM politikasında yer alır.', 'WhereToGo is not directed to children. It applies zero tolerance to content and conduct involving child sexual abuse or exploitation; the permanent CSAM policy contains the detailed safety standard.')],
      },
    ],
  },
  'wheretogo-terms': {
    eyebrow: localized('WhereToGo / yasal', 'WhereToGo / legal'),
    title: localized('WhereToGo kullanım koşulları', 'WhereToGo terms of use'),
    intro: localized('Bu koşullar; konum keşfi, iki kişilik oturum, kaydırma ve karşılıklı eşleşme özelliklerini kullanırken geçerli sınırları açıklar.', 'These terms explain the boundaries that apply when using location discovery, two-person sessions, swiping, and mutual-match features.'),
    updated: true,
    sections: [
      {
        heading: localized('Hizmet ve hesap', 'Service and account'),
        paragraphs: [localized('WhereToGo, iki kişinin yer önerilerini ayrı ayrı değerlendirmesine ve ortak beğenileri bulmasına yardımcı olan bir keşif aracıdır. Hesap veya oturum bilgilerinizin doğruluğundan ve giriş bilgilerinizin güvenliğinden siz sorumlusunuz. Başka bir kişinin hesabını, oturum kodunu veya kimliğini izinsiz kullanamazsınız.', 'WhereToGo is a discovery tool that helps two people evaluate place suggestions independently and find mutual likes. You are responsible for accurate account or session information and for protecting your credentials. You may not use another person’s account, session code, or identity without permission.')],
      },
      {
        heading: localized('Güvenli ve kabul edilebilir kullanım', 'Safe and acceptable use'),
        paragraphs: [localized('Uygulamayı araç kullanırken veya dikkatinizin gerçek çevreden ayrılmasının tehlike yaratacağı bir anda kullanmayın. Trafik işaretleri, erişim kısıtları, mülk kuralları ve yerel mevzuat her zaman uygulamadaki yönlendirmeden önce gelir. Taciz, kimliğe bürünme, otomatik veri toplama, güvenlik aşma veya yasa dışı amaçlarla kullanım yasaktır.', 'Do not use the app while driving or whenever distraction from your physical surroundings could create danger. Traffic signs, access restrictions, property rules, and local law always take priority over in-app guidance. Harassment, impersonation, automated scraping, security bypass, and unlawful use are prohibited.')],
      },
      {
        heading: localized('Yer ve rota bilgilerinin doğruluğu', 'Accuracy of place and route information'),
        paragraphs: [localized('Yer adları, çalışma saatleri, mesafe, uygunluk, rota ve trafik bilgileri üçüncü taraf kaynaklardan gelebilir ve gecikebilir ya da hatalı olabilir. Bir yere gitmeden önce koşulları bağımsız olarak doğrulayın. WhereToGo acil durum, güvenlik veya profesyonel navigasyon hizmeti değildir.', 'Place names, opening hours, distance, availability, route, and traffic information may come from third-party sources and can be delayed or inaccurate. Verify conditions independently before travelling. WhereToGo is not an emergency, safety, or professional navigation service.')],
      },
      {
        heading: localized('Fikri mülkiyet ve üçüncü taraflar', 'Intellectual property and third parties'),
        paragraphs: [localized('Uygulama arayüzü ve özgün içeriği, uygulanabilir fikri mülkiyet haklarıyla korunur. Harita, yer verisi ve harici uygulama bağlantıları ilgili sağlayıcının şartlarına tabidir. Üçüncü taraf hizmetlerinin kesintisi veya içeriği kontrolümüz dışında olabilir.', 'The app interface and original content are protected by applicable intellectual-property rights. Maps, place data, and external-app links are subject to the relevant provider’s terms. Third-party service availability and content may be outside our control.')],
      },
      {
        heading: localized('Kullanılabilirlik, askıya alma ve sorumluluk', 'Availability, suspension, and liability'),
        paragraphs: [localized('Hizmet “olduğu gibi” ve “mevcut olduğu ölçüde” sunulur; sürekli, eksiksiz veya hatasız olacağı garanti edilmez. Güvenlik, kötüye kullanım, bakım veya yasal gereklilik nedeniyle erişim sınırlandırılabilir. Kanunun izin verdiği ölçüde, yer veya rota verisine güvenilmesinden doğan dolaylı kayıplar için sorumluluk kabul edilmez; kanunen sınırlandırılamayan sorumluluklar saklıdır.', 'The service is provided “as is” and “as available” without a guarantee that it will be continuous, complete, or error-free. Access may be restricted for security, abuse, maintenance, or legal reasons. To the extent permitted by law, liability is excluded for indirect loss arising from reliance on place or route data; liability that cannot legally be limited remains unaffected.')],
      },
    ],
  },
  'wheretogo-csam': {
    eyebrow: localized('WhereToGo / güvenlik', 'WhereToGo / safety'),
    title: localized('Çocuk güvenliği standartları', 'Child safety standards'),
    intro: localized('WhereToGo, çocukların cinsel istismarı ve sömürüsüyle ilgili içerik ve davranışlara karşı sıfır tolerans uygular.', 'WhereToGo applies zero tolerance to content and conduct involving child sexual abuse or exploitation.'),
    updated: true,
    sections: [
      {
        heading: localized('Yasaklanan içerik ve davranış', 'Prohibited content and conduct'),
        paragraphs: [localized('Çocukların cinsel istismarını tasvir eden, teşvik eden, talep eden, dağıtan veya kolaylaştıran her türlü içerik ve davranış kesinlikle yasaktır. Reşit olmayan kişileri hedefleyen grooming, cinsel tehdit, sextortion ve insan ticareti de bu kapsamdadır.', 'Any content or conduct depicting, promoting, requesting, distributing, or facilitating child sexual abuse is strictly prohibited. This includes grooming, sexual threats, sextortion, and trafficking targeting minors.')],
      },
      {
        heading: localized('Uygulama ve bildirim', 'Enforcement and reporting'),
        paragraphs: [localized('Şüpheli hesap veya içerikler engellenebilir, korunması gereken kanıtlar güvenli biçimde muhafaza edilebilir ve hukuken gerekli olduğunda yetkili makamlara bildirim yapılabilir. Acil tehlike varsa önce yerel acil yardım birimlerine başvurun; ürün içi raporlama imkânı yoksa aşağıdaki adrese ayrıntı gönderin.', 'Suspected accounts or content may be blocked, evidence that must be preserved may be secured, and reports may be made to competent authorities where legally required. If someone is in immediate danger, contact local emergency services first; if in-product reporting is unavailable, send details to the address below.')],
      },
    ],
  },
  'dua-news': {
    eyebrow: localized('DuaAPP / duyurular', 'DuaAPP / notices'),
    title: localized('DuaAPP güncellemeleri', 'DuaAPP updates'),
    intro: localized('Önemli hizmet, güvenlik ve politika duyuruları bu kalıcı adreste yayımlanır.', 'Important service, security, and policy notices are published at this permanent address.'),
    updated: false,
    sections: [{ heading: localized('Güncel durum', 'Current status'), paragraphs: [localized('Şu anda yayımlanmış aktif bir hizmet duyurusu bulunmuyor.', 'There is currently no active public service notice.')] }],
  },
  'wheretogo-news': {
    eyebrow: localized('WhereToGo / duyurular', 'WhereToGo / notices'),
    title: localized('WhereToGo güncellemeleri', 'WhereToGo updates'),
    intro: localized('Önemli hizmet, güvenlik ve politika duyuruları bu kalıcı adreste yayımlanır.', 'Important service, security, and policy notices are published at this permanent address.'),
    updated: false,
    sections: [{ heading: localized('Güncel durum', 'Current status'), paragraphs: [localized('Şu anda yayımlanmış aktif bir hizmet duyurusu bulunmuyor.', 'There is currently no active public service notice.')] }],
  },
};

export default function LegalPage({ kind }: { kind: LegalPageKind }) {
  const { locale } = useAppPreferences();
  const { settings } = useContent();
  const localeHref = useLocaleHref();
  const policy = policies[kind];
  const value = (text: LocalizedText) => text[locale];
  const pathByKind: Record<LegalPageKind, string> = {
    privacy: '/privacy', terms: '/terms', 'account-deletion': '/account-delete',
    'wheretogo-privacy': '/wheretogo/privacy', 'wheretogo-terms': '/wheretogo/terms',
    'wheretogo-csam': '/wheretogo/csam', 'dua-news': '/dua/news', 'wheretogo-news': '/wheretogo/news',
  };

  useDocumentMeta({
    title: `${value(policy.title)} — ACKaraca`,
    description: value(policy.intro),
    path: pathByKind[kind],
    locale,
    noIndex: kind.endsWith('news') || kind === 'account-deletion',
  });

  return (
    <main id="main-content" tabIndex={-1} className="page legal-page">
      <header className="legal-hero shell">
        <Link href={localeHref('/')} className="legal-back"><ArrowLeft aria-hidden="true" />{locale === 'tr' ? 'Portfolyoya dön' : 'Back to portfolio'}</Link>
        <span className="eyebrow">{value(policy.eyebrow)}</span>
        <h1>{value(policy.title)}</h1>
        <p>{value(policy.intro)}</p>
        {policy.updated ? <small>{locale === 'tr' ? 'Son güncelleme: 4 Ağustos 2026' : 'Last updated: 4 August 2026'}</small> : null}
      </header>

      <div className="shell legal-layout">
        <aside>
          <ShieldCheck aria-hidden="true" />
          <span>{locale === 'tr' ? 'İletişim' : 'Contact'}</span>
          <a href={`mailto:${settings.contactEmail}`}><Mail aria-hidden="true" />{settings.contactEmail}</a>
          {kind === 'account-deletion' ? <a href={`mailto:${settings.contactEmail}?subject=${encodeURIComponent('Account deletion')}`}>{locale === 'tr' ? 'Talebi başlat' : 'Start request'}<ExternalLink aria-hidden="true" /></a> : null}
        </aside>
        <article className="legal-copy">
          {policy.sections.map((section, index) => (
            <section key={value(section.heading)} id={`section-${index + 1}`}>
              <span>0{index + 1}</span>
              <h2>{value(section.heading)}</h2>
              {section.paragraphs.map((paragraph) => <p key={value(paragraph)}>{value(paragraph)}</p>)}
              {section.items ? <ul>{section.items.map((item) => <li key={value(item)}>{value(item)}</li>)}</ul> : null}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
