import { handleApiRequest } from '../_lib/router.ts';
import type { Env } from '../_lib/types.ts';

interface PagesFunctionContext {
  request: Request;
  env: Env;
}

export const onRequest = async (context: PagesFunctionContext): Promise<Response> => {
  return handleApiRequest(context.request, context.env);
};
