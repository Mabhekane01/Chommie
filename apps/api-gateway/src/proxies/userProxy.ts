// src/proxies/userProxy.ts
import { createServiceProxy } from './baseProxy.js';
import { baseConfig as config } from '@packages/config/env';

export const userProxy = createServiceProxy(config.services.user, {
  '^/api/users': '', // Remove /api/users prefix
});
