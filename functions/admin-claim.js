const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

const normalizedEmail = (value, name) => {
  if (
    typeof value !== 'string'
    || value.trim() !== value
    || value !== value.toLowerCase()
    || !EMAIL.test(value)
  ) throw new Error(`${name} must be a normalized lowercase email address.`);
  return value;
};

export const validateAdminClaimTarget = ({ action, targetEmail, configuredOwnerEmail }) => {
  const normalizedTarget = normalizedEmail(targetEmail, 'FIREBASE_ADMIN_EMAIL');
  if (action === 'grant') {
    const normalizedOwner = normalizedEmail(configuredOwnerEmail, 'ACKARACA_ADMIN_EMAIL');
    if (normalizedTarget !== normalizedOwner) {
      throw new Error('The claim target must exactly match ACKARACA_ADMIN_EMAIL.');
    }
  }
  return normalizedTarget;
};
