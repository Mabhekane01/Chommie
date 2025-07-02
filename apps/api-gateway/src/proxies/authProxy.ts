//api-gateway/src/proxies/authProxy.ts
import { createServiceProxy } from './baseProxy.js';
import { baseConfig as config } from '@packages/config/env';

export const authProxy = createServiceProxy(config.services.auth, {
  '^/api/auth': '',
});
