import { mockGet, mockPatch, mockPut } from 'vi-fetch';
import { describe, expect, test, vi } from 'vitest';

import Backend from '../src/index';
import { defaultOptions } from '../src/model';

describe('initialization', () => {
  test('empty object plain construction', () => {
    const backend = new Backend();

    expect(backend.services).toBeUndefined();
    expect(backend.options).toStrictEqual(defaultOptions);
    expect(backend.i18nextOptions).toStrictEqual({});
  });

  test('object plain construction with options', () => {
    const backend = new Backend(null, { DB: 'my_database', NS: 'my_namespace' });

    expect(backend.services).toBeNull();
    expect(backend.options).toStrictEqual({
      ...defaultOptions,
      DB: 'my_database',
      NS: 'my_namespace',
    });
    expect(backend.i18nextOptions).toStrictEqual({});
  });

  test('empty object construction with init function', () => {
    const backend = new Backend();
    backend.init(null, { DB: 'my_database', NS: 'my_namespace' });

    expect(backend.services).toBeNull();
    expect(backend.options).toStrictEqual({
      ...defaultOptions,
      DB: 'my_database',
      NS: 'my_namespace',
    });
    expect(backend.i18nextOptions).toStrictEqual({});
  });
});

describe('authorization', () => {
  test('has correct authorization header', () => {
    const user = 'user';
    const pass = 'pass';

    const backend = new Backend(null, { auth: { user, pass } });

    const credentials = btoa(`${user}:${pass}`);

    expect(backend.headers.has('Authorization')).toBeTruthy();
    expect(backend.headers.get('Authorization')).toBe(`Basic ${credentials}`);
  });
});

describe('read translation', () => {
  const PATH = 'path/to/db';
  const NS = 'ns';
  const LNG = 'lng';

  const backend = new Backend(null, { path: PATH });

  test('fetch throws error', async () => {
    const mockedGet = mockGet(`${PATH}/key/${NS}/${LNG}`, true).willThrow('error_message');
    const mockedCallback = vi.fn();

    // I had to assign fetch function and mocking
    backend.options.customFetch = fetch;
    await backend.read(LNG, NS, mockedCallback);

    expect(mockedGet).toHaveFetchedTimes(1);
    expect(mockedCallback).toHaveBeenCalledTimes(1);
    expect(mockedCallback).toHaveBeenCalledWith(TypeError('error_message'), null);
  });

  test('fetch responses with error', async () => {
    const mockedGet = mockGet(`${PATH}/key/${NS}/${LNG}`, true).willResolve([
      { status: 'ERR', detail: 'error_message' },
    ]);
    const mockedCallback = vi.fn();

    backend.options.customFetch = fetch;
    await backend.read(LNG, NS, mockedCallback);

    expect(mockedGet).toHaveFetchedTimes(1);
    expect(mockedCallback).toHaveBeenCalledTimes(1);
    expect(mockedCallback).toHaveBeenCalledWith('error_message', null);
  });

  test('fetch responses with result', async () => {
    const data = { key1: 'value1' };
    const mockedGet = mockGet(`${PATH}/key/${NS}/${LNG}`, true).willResolve([{ result: [data] }]);
    const mockedCallback = vi.fn();

    backend.options.customFetch = fetch;
    await backend.read(LNG, NS, mockedCallback);

    expect(mockedGet).toHaveFetchedTimes(1);
    expect(mockedCallback).toHaveBeenCalledTimes(1);
    expect(mockedCallback).toHaveBeenCalledWith(null, data);
  });

  test('fetch responses with empty result', async () => {
    const mockedGet = mockGet(`${PATH}/key/${NS}/${LNG}`, true).willResolve([{ result: [] }]);
    const mockedCallback = vi.fn();

    backend.options.customFetch = fetch;
    await backend.read(LNG, NS, mockedCallback);

    expect(mockedGet).toHaveFetchedTimes(1);
    expect(mockedCallback).toHaveBeenCalledTimes(1);
    expect(mockedCallback).toHaveBeenCalledWith(null, {});
  });
});

describe('create translation', () => {
  const PATH = 'path/to/db';
  const NS = 'ns';
  const backend = new Backend(null, { path: PATH });

  test('create translation', () => {
    const KEY = 'key';
    const VAL = 'val';

    const mockedPatch = mockPatch(RegExp(`${PATH}/key/${NS}/*`), true).willResolve();

    backend.options.customFetch = fetch;
    backend.create(['lng1', 'lng2', 'lng3'], NS, KEY, VAL);

    expect(mockedPatch).toHaveFetchedTimes(3);
    expect(mockedPatch).toHaveFetchedWithBody({ [KEY]: VAL });
  });
});

describe('save translation', () => {
  const PATH = 'path/to/db';
  const NS = 'ns';
  const backend = new Backend(null, { path: PATH });

  test('save translation', () => {
    const LNG = 'lng';
    const data = { key: 'value' };

    const mockedPut = mockPut(`${PATH}/key/${NS}/${LNG}`, true).willResolve();

    backend.options.customFetch = fetch;
    backend.save(LNG, NS, data);

    expect(mockedPut).toHaveFetchedTimes(1);
    expect(mockedPut).toHaveFetchedWithBody(data);
  });
});
