import { httpsCallable } from 'firebase/functions';
import { InquirySchema, type Inquiry } from '../../domain/content';
import { requirePublicFirebaseServices } from './publicClient';

type PublicInquiry = Omit<Inquiry, 'id' | 'status' | 'createdAt'>;

interface SubmitInquiryResponse {
  ok: true;
  id: string;
}

export const submitInquiry = async (input: PublicInquiry): Promise<SubmitInquiryResponse> => {
  const parsed = InquirySchema.parse({ ...input, status: 'new' });
  const payload = {
    name: parsed.name,
    email: parsed.email,
    inquiryType: parsed.inquiryType,
    message: parsed.message,
    locale: parsed.locale,
    privacyConsent: parsed.privacyConsent,
    website: parsed.website ?? '',
    ...(parsed.organization ? { organization: parsed.organization } : {}),
    ...(parsed.budgetBand ? { budgetBand: parsed.budgetBand } : {}),
    ...(parsed.timeline ? { timeline: parsed.timeline } : {}),
  } satisfies PublicInquiry;
  const { functions } = requirePublicFirebaseServices();
  const callable = httpsCallable<typeof payload, SubmitInquiryResponse>(functions, 'submitInquiry', {
    limitedUseAppCheckTokens: true,
  });
  const result = await callable(payload);
  if (
    result.data.ok !== true
    || typeof result.data.id !== 'string'
    || result.data.id.length === 0
  ) throw new Error('The inquiry service returned an invalid response.');
  return result.data;
};
