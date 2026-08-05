export const inquiryLimitExceeded = ({
  ipCount,
  emailCount,
  globalCount,
  maximumPerIp,
  maximumPerEmail,
  maximumGlobal
}) => (
  ipCount >= maximumPerIp
  || emailCount >= maximumPerEmail
  || globalCount >= maximumGlobal
);

export const inquirySubmissionAvailable = (settings) => (
  settings?.availability === 'open-to-inquiries'
  || settings?.availability === 'limited'
);
