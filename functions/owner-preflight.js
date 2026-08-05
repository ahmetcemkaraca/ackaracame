const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

const assertNormalizedEmail = (value) => {
  if (
    typeof value !== 'string'
    || value.trim() !== value
    || value !== value.toLowerCase()
    || !EMAIL.test(value)
  ) throw new Error('ACKARACA_ADMIN_EMAIL must be a normalized lowercase email address.');
  return value;
};

export const validateOwnerPreflight = ({ mode, configuredEmail, user, ownerPolicy }) => {
  if (!['bootstrap', 'normal'].includes(mode)) {
    throw new Error('Owner preflight mode must be bootstrap or normal.');
  }
  const expectedEmail = assertNormalizedEmail(configuredEmail);
  if (!user || typeof user !== 'object' || typeof user.uid !== 'string' || !user.uid) {
    throw new Error('The configured sole-owner Auth account does not exist.');
  }
  if (user.email !== expectedEmail) {
    throw new Error('The sole-owner Auth email is not the exact configured lowercase address.');
  }
  if (user.emailVerified !== true || user.disabled === true) {
    throw new Error('The sole-owner Auth account must be verified and enabled.');
  }
  if (!user.providerData?.some((provider) => provider?.providerId === 'password')) {
    throw new Error('The sole-owner account must have the email/password first-factor provider.');
  }

  if (mode === 'normal') {
    if (user.customClaims?.admin !== true) {
      throw new Error('The sole-owner account is missing the admin custom claim.');
    }
    if (!user.multiFactor?.enrolledFactors?.some((factor) => factor?.factorId === 'totp')) {
      throw new Error('The sole-owner account must have an enrolled TOTP factor.');
    }
    if (
      !ownerPolicy
      || ownerPolicy.schemaVersion !== 1
      || ownerPolicy.uid !== user.uid
      || ownerPolicy.email !== expectedEmail
    ) {
      throw new Error('The Firestore owner-access policy is missing or does not exactly match Auth.');
    }
  }

  return { uid: user.uid, email: expectedEmail, mode };
};
