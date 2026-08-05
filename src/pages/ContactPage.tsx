import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUpRight, CheckCircle2, Copy, Mail, Send, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'wouter';
import { z } from 'zod';
import { useAppPreferences } from '../context/AppPreferences';
import { useContent } from '../context/Content';
import { InquirySchema } from '../domain/content';
import { publicInquiryConfigured } from '../lib/firebase/config';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { isAcceptingInquiries } from '../lib/availability';

const ContactFormSchema = InquirySchema.omit({ id: true, status: true, createdAt: true }).extend({
  privacyConsent: z.boolean().refine((value) => value, 'Consent is required.'),
});

type ContactFormInput = z.input<typeof ContactFormSchema>;
type ContactFormOutput = z.output<typeof ContactFormSchema>;

const copy = {
  tr: {
    eyebrow: 'İletişim / yeni bir konuşma', title: 'İyi bir problemle başlayalım.',
    intro: 'Bir rol, ürün fikri, mimari araç veya işbirliği üzerine konuşmak istiyorsanız; bağlamı ve hedefi kısaca yazın. Mesajları doğrudan ben okuyorum.',
    direct: 'Doğrudan e-posta', copy: 'Kopyala', copied: 'Kopyalandı',
    privacyTitle: 'Mesajınız özel kalır.', privacyBody: 'Bilgiler yalnızca talebinize yanıt vermek ve güvenliği sağlamak için kullanılır; pazarlama listesine eklenmez.',
    name: 'Ad soyad', email: 'E-posta', organization: 'Şirket / ekip (opsiyonel)', type: 'Görüşme türü', budget: 'Bütçe aralığı (opsiyonel)', timeline: 'Zamanlama (opsiyonel)', message: 'Kısaca anlatın',
    consent: 'Mesajımın yanıtlanması amacıyla bilgilerimin işlenmesini kabul ediyorum.', submit: 'Mesajı güvenli gönder', sending: 'Gönderiliyor…',
    successTitle: 'Mesaj ulaştı.', successBody: 'Teşekkürler. Bağlamı inceledikten sonra doğrudan e-posta üzerinden dönüş yapacağım.', another: 'Yeni mesaj gönder',
    fallback: 'Güvenli form bu ortamda yapılandırılmadığı için e-posta uygulamanız açılacak.', error: 'Mesaj gönderilemedi. Lütfen doğrudan e-posta adresini kullanın.',
    unavailableTitle: 'Yeni görüşme formu şu anda kapalı.', unavailableBody: 'Ürün desteği, güvenlik bildirimi veya yasal talep için doğrudan e-posta kanalını kullanabilirsiniz.',
  },
  en: {
    eyebrow: 'Contact / a new conversation', title: 'Let’s begin with a good problem.',
    intro: 'If you would like to discuss a role, a product idea, an architecture tool, or a collaboration, share the context and goal briefly. I read every message directly.',
    direct: 'Direct email', copy: 'Copy', copied: 'Copied',
    privacyTitle: 'Your message stays private.', privacyBody: 'The information is used only to respond to your request and keep the service secure; it is not added to a marketing list.',
    name: 'Full name', email: 'Email', organization: 'Company / team (optional)', type: 'Conversation type', budget: 'Budget band (optional)', timeline: 'Timeline (optional)', message: 'Tell me briefly',
    consent: 'I consent to my information being processed for the purpose of responding to this message.', submit: 'Send message securely', sending: 'Sending…',
    successTitle: 'Message received.', successBody: 'Thank you. I will review the context and reply directly by email.', another: 'Send another message',
    fallback: 'The secure form is not configured in this environment, so your email app will open.', error: 'The message could not be sent. Please use the direct email address.',
    unavailableTitle: 'The new-enquiry form is currently closed.', unavailableBody: 'For product support, security reports, or legal requests, you can still use the direct email channel.',
  },
} as const;

export default function ContactPage() {
  const { locale } = useAppPreferences();
  const { settings } = useContent();
  const t = copy[locale];
  const acceptingInquiries = isAcceptingInquiries(settings.availability);
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const form = useForm<ContactFormInput, unknown, ContactFormOutput>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: '', email: '', organization: '', inquiryType: 'employment', budgetBand: 'not-specified',
      timeline: 'flexible', message: '', locale, privacyConsent: false, website: '',
    },
  });
  const message = String(form.watch('message') ?? '');

  useDocumentMeta({ title: locale === 'tr' ? 'İletişim — Ahmet Cem Karaca' : 'Contact — Ahmet Cem Karaca', description: t.intro, path: '/contact', locale });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!acceptingInquiries) return;
    setState('submitting');
    const payload = InquirySchema.parse({ ...values, privacyConsent: true, locale });
    try {
      if (!publicInquiryConfigured) {
        const subject = locale === 'tr' ? `Portfolyo görüşmesi: ${values.inquiryType}` : `Portfolio inquiry: ${values.inquiryType}`;
        const body = `${values.name}\n${values.organization || ''}\n\n${values.message}`;
        window.location.assign(`mailto:${settings.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        setState('idle');
        return;
      }
      const { submitInquiry } = await import('../lib/firebase/inquiries');
      await submitInquiry(payload);
      setState('success');
      form.reset({ ...form.formState.defaultValues, locale });
    } catch {
      setState('error');
    }
  });

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(settings.contactEmail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.assign(`mailto:${settings.contactEmail}`);
    }
  };

  const typeOptions = [
    ['employment', locale === 'tr' ? 'İş / rol görüşmesi' : 'Role / employment'],
    ['architecture', locale === 'tr' ? 'Mimarlık projesi' : 'Architecture project'],
    ['product', locale === 'tr' ? 'Dijital ürün' : 'Digital product'],
    ['collaboration', locale === 'tr' ? 'İşbirliği' : 'Collaboration'],
    ['speaking', locale === 'tr' ? 'Konuşma / etkinlik' : 'Speaking / event'],
    ['other', locale === 'tr' ? 'Diğer' : 'Other'],
  ];

  return (
    <main id="main-content" tabIndex={-1} className="page contact-page">
      <header className="contact-hero shell"><span className="eyebrow">{t.eyebrow}</span><div><h1>{t.title}</h1><p>{t.intro}</p></div></header>
      <div className="shell contact-layout">
        <aside className="contact-aside">
          {!acceptingInquiries ? <p className="contact-fallback" role="status"><Mail aria-hidden="true" />{locale === 'tr' ? 'Şu anda yeni rol veya proje görüşmesi kabul etmiyorum. Ürün desteği ve yasal talepler için e-posta kanalı açık.' : 'I am not accepting new role or project enquiries right now. Email remains open for product support and legal requests.'}</p> : null}
          <div><span>{t.direct}</span><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}<ArrowUpRight aria-hidden="true" /></a><button type="button" onClick={copyEmail}><Copy aria-hidden="true" />{copied ? t.copied : t.copy}</button></div>
          <div className="contact-privacy"><ShieldCheck aria-hidden="true" /><h2>{t.privacyTitle}</h2><p>{t.privacyBody}</p><Link href="/privacy">{locale === 'tr' ? 'Gizlilik politikasını oku' : 'Read the privacy policy'}</Link></div>
          {acceptingInquiries && !publicInquiryConfigured ? <p className="contact-fallback"><Mail aria-hidden="true" />{t.fallback}</p> : null}
        </aside>

        <section className="contact-form-panel">
          {!acceptingInquiries ? (
            <div className="contact-success" role="status">
              <Mail aria-hidden="true" />
              <h2>{t.unavailableTitle}</h2>
              <p>{t.unavailableBody}</p>
              <a className="button button--ghost" href={`mailto:${settings.contactEmail}`}>{t.direct}<ArrowUpRight aria-hidden="true" /></a>
            </div>
          ) : state === 'success' ? (
            <div className="contact-success" role="status"><CheckCircle2 aria-hidden="true" /><h2>{t.successTitle}</h2><p>{t.successBody}</p><button type="button" className="button button--ghost" onClick={() => setState('idle')}>{t.another}</button></div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <label><span>{t.name}</span><input id="contact-name" {...form.register('name')} autoComplete="name" aria-invalid={Boolean(form.formState.errors.name)} aria-describedby={form.formState.errors.name ? 'contact-name-error' : undefined} />{form.formState.errors.name ? <small id="contact-name-error">{locale === 'tr' ? 'Adınız en az iki karakter olmalıdır.' : 'Your name must contain at least two characters.'}</small> : null}</label>
                <label><span>{t.email}</span><input id="contact-email" {...form.register('email')} type="email" autoComplete="email" aria-invalid={Boolean(form.formState.errors.email)} aria-describedby={form.formState.errors.email ? 'contact-email-error' : undefined} />{form.formState.errors.email ? <small id="contact-email-error">{locale === 'tr' ? 'Geçerli bir e-posta adresi girin.' : 'Enter a valid email address.'}</small> : null}</label>
                <label className="form-grid__wide"><span>{t.organization}</span><input {...form.register('organization')} autoComplete="organization" /></label>
                <label><span>{t.type}</span><select {...form.register('inquiryType')}>{typeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label><span>{t.budget}</span><select {...form.register('budgetBand')}><option value="not-specified">—</option><option value="under-5k">&lt; €5k</option><option value="5k-15k">€5k—15k</option><option value="15k-50k">€15k—50k</option><option value="over-50k">€50k+</option></select></label>
                <label><span>{t.timeline}</span><select {...form.register('timeline')}><option value="not-specified">—</option><option value="as-soon-as-possible">{locale === 'tr' ? 'Mümkün olan en kısa sürede' : 'As soon as possible'}</option><option value="one-to-three-months">{locale === 'tr' ? '1—3 ay' : '1—3 months'}</option><option value="flexible">{locale === 'tr' ? 'Esnek' : 'Flexible'}</option></select></label>
                <label className="form-grid__wide"><span>{t.message}</span><textarea id="contact-message" {...form.register('message')} rows={8} maxLength={4000} aria-invalid={Boolean(form.formState.errors.message)} aria-describedby={`contact-message-count${form.formState.errors.message ? ' contact-message-error' : ''}`} /><small id="contact-message-count" className="form-counter">{message.length} / 4000</small>{form.formState.errors.message ? <small id="contact-message-error">{locale === 'tr' ? 'Mesajınız 20 ile 4000 karakter arasında olmalıdır.' : 'Your message must be between 20 and 4,000 characters.'}</small> : null}</label>
              </div>
              <label className="honeypot" aria-hidden="true"><span>Website</span><input {...form.register('website')} tabIndex={-1} autoComplete="off" /></label>
              <label className="consent-check"><input type="checkbox" {...form.register('privacyConsent')} aria-invalid={Boolean(form.formState.errors.privacyConsent)} aria-describedby={form.formState.errors.privacyConsent ? 'contact-consent-error' : undefined} /><span>{t.consent}</span></label>
              {form.formState.errors.privacyConsent ? <p id="contact-consent-error" className="form-error">{locale === 'tr' ? 'Devam etmek için gizlilik onayı gereklidir.' : 'Privacy consent is required to continue.'}</p> : null}
              {state === 'error' ? <p className="form-error" role="alert">{t.error}</p> : null}
              <button type="submit" className="button button--primary contact-submit" disabled={state === 'submitting'}>{state === 'submitting' ? t.sending : t.submit}<Send aria-hidden="true" /></button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
