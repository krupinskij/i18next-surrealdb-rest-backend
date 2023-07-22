import { Services, InitOptions, BackendModule, ReadCallback, ResourceLanguage } from 'i18next';

import fetch from './helpers/fetch';
import { Options, RequiredOptions, defaultOptions } from './model';

class Backend implements BackendModule<Options> {
  readonly type = 'backend';
  static readonly type = 'backend';

  services?: Services | null;
  options!: RequiredOptions;
  i18nextOptions?: InitOptions;

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
      const data = await fetch(`${this.options.path}/key/${namespace}/${language}`, {
        headers: this.headers,
        method: 'GET',
        ...this.options.requestOptions,
      })
        .then((resp) => resp.json())
        .catch((err) => {
          callback(err, null);
        });

      const { result, status, detail } = data[0];

      if (status === 'ERR') {
        callback(detail, null);
      } else {
        callback(null, result[0] || {});
      }
    } catch (err) {
      callback(err as any, null);
    }
  }

  async create(
    languages: readonly string[],
    namespace: string,
    key: string,
    fallbackValue: string
  ) {
    console.log(languages, namespace, key, fallbackValue);
  }

  save(language: string, namespace: string, data: ResourceLanguage) {
    console.log(language, namespace, data);
  }
}

export default Backend;
export { Options };
