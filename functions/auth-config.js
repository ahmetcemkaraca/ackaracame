const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const isTotpProvider = (provider) => (
  isRecord(provider) && isRecord(provider.totpProviderConfig)
);

export const buildEnabledTotpConfig = (currentConfig) => {
  const current = isRecord(currentConfig) ? currentConfig : {};
  const existingProviders = Array.isArray(current.providerConfigs)
    ? current.providerConfigs.filter((provider) => isRecord(provider) && !isTotpProvider(provider))
    : [];
  const next = {
    state: 'ENABLED',
    providerConfigs: [
      ...existingProviders.map((provider) => ({ ...provider })),
      {
        state: 'ENABLED',
        totpProviderConfig: { adjacentIntervals: 1 }
      }
    ]
  };
  if (Array.isArray(current.factorIds)) {
    next.factorIds = [...current.factorIds];
  }
  return next;
};

export const hasExpectedTotpConfig = (config) => {
  if (!isRecord(config) || config.state !== 'ENABLED' || !Array.isArray(config.providerConfigs)) {
    return false;
  }
  const totpProviders = config.providerConfigs.filter(isTotpProvider);
  return totpProviders.length === 1
    && totpProviders[0].state === 'ENABLED'
    && totpProviders[0].totpProviderConfig.adjacentIntervals === 1;
};
