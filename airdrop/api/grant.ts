import type { VercelRequest, VercelResponse } from '@vercel/node';

function getConfig() {
  const config = {
    defaults: {
      origin: 'https://apps.darwinia.network',
      transport: 'querystring',
      state: true,
    },
    github: {
      key: '{{ github_oauth_app_key }}',
      secret: '{{ github_oauth_app_secret }}',
      scope: [],
      callback: '/api/pangoro/authorization',
    },
  };
  config.github.key = process.env.GITHUB_OAUTH_APP_KEY ?? '';
  config.github.secret = process.env.GITHUB_OAUTH_APP_SECRET ?? '';
  return config;
}

const grant = require('grant').vercel({
  config: getConfig(),
  session: { secret: 'grant' },
});

export default async function (req: VercelRequest, res: VercelResponse) {
  await grant(req, res);
}
