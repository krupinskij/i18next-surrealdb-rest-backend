import { prepareFetch, mockFetch } from 'vi-fetch';
import 'vi-fetch/setup';
import { beforeAll, beforeEach } from 'vitest';

beforeAll(() => {
  prepareFetch(global);
});

beforeEach(() => {
  mockFetch.clearAll();
});
