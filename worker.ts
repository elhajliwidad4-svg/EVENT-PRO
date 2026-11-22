import { handleApiRequest } from './functions/_lib/router.ts';
import type { Env } from './functions/_lib/types.ts';

interface AssetsFetcher {
  fetch(request: Request): Promise<Response>;
}

interface WorkerEnv extends Env {
  ASSETS?: AssetsFetcher;
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Assets binding manquant dans la configuration Cloudflare Worker.', {
      status: 500,
    });
  },
};
