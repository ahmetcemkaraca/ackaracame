const hasControlCharacter = (value) => [...value].some((character) => {
  const code = character.charCodeAt(0);
  return code < 32 || code === 127;
});

export const buildRebuildWebhookRequest = ({ provider, token, payload }) => {
  if (
    !['generic', 'github'].includes(provider)
    || typeof token !== 'string'
    || token.length < 20
    || token.length > 2048
    || hasControlCharacter(token)
  ) {
    throw new Error('The rebuild webhook provider authentication is invalid.');
  }
  const sharedHeaders = {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
    'user-agent': 'ackaraca-site-rebuild/3.0'
  };
  if (provider === 'github') {
    return {
      headers: {
        ...sharedHeaders,
        accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28'
      },
      body: JSON.stringify({
        event_type: 'site-rebuild',
        client_payload: payload
      })
    };
  }
  return {
    headers: sharedHeaders,
    body: JSON.stringify({
      event: 'site.rebuild.requested',
      ...payload
    })
  };
};
