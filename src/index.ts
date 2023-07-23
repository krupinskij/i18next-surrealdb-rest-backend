import { Services, InitOptions, BackendModule, ReadCallback, ResourceLanguage } from 'i18next';

import { Options, RequiredOptions, defaultOptions } from './model';

class Backend implements BackendModule<Options> {
  readonly type = 'backend';
  static readonly type = 'backend';

  services?: Services | null;
  options!: RequiredOptions;
  i18nextOptions!: InitOptions;

  headers!: Headers;

  constructor(services?: Services | null, options?: Options, i18nextOptions: InitOptions = {}) {
    this.init(services, options, i18nextOptions);
  }

  init(services?: Services | null, options?: Options, i18nextOptions: InitOptions = {}) {
    this.services = services;
    this.options = { ...defaultOptions, ...options };
    this.i18nextOptions = i18nextOptions;

    this.headers = new Headers(this.options.customHeaders);

    const { NS, DB, auth } = this.options;

    this.headers.set('NS', NS);
    this.headers.set('DB', DB);
    this.headers.set('Accept', 'application/json');

    if (auth) {
      const { user, pass } = auth;
      const credentials = btoa(`${user}:${pass}`);
      this.headers.set('Authorization', `Basic ${credentials}`);
    }
  }

  async read(language: string, namespace: string, callback: ReadCallback) {
    try {
      const [data] = await this.options
        .customFetch(`${this.options.path}/key/${namespace}/${language}`, {
          headers: this.headers,
          method: 'GET',
          ...this.options.requestOptions,
        })
        .then((resp) => resp.json());

      const { result, status, detail } = data;

      if (status === 'ERR') {
        callback(detail, null);
      } else {
        callback(null, result[0] || {});
      }
    } catch (err) {
      callback(err as any, null);
    }
  }

  createSingle(language: string, namespace: string, key: string, fallbackValue: string) {
    return this.options.customFetch(`${this.options.path}/key/${namespace}/${language}`, {
      headers: this.headers,
      method: 'PATCH',
      body: JSON.stringify({ [key]: fallbackValue }),
      ...this.options.requestOptions,
    });
  }

  create(languages: readonly string[], namespace: string, key: string, fallbackValue: string) {
    Promise.allSettled(
      languages.map((language) => this.createSingle(language, namespace, key, fallbackValue))
    );
  }

  save(language: string, namespace: string, data: ResourceLanguage) {
    this.options.customFetch(`${this.options.path}/key/${namespace}/${language}`, {
      headers: this.headers,
      method: 'PUT',
      body: JSON.stringify(data),
      ...this.options.requestOptions,
    });
  }
}

export default Backend;
export { Options };
