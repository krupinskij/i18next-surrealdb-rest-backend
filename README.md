# Introduction

This is a simple i18next backend to be used with [SurrealDB](https://surrealdb.com/) over [REST API](https://surrealdb.com/docs/integration/http).

# Getting started

```bash
# npm package
$ npm install i18next-surealdb-rest-backend
```

```js
import i18next from 'i18next';
import Backend from 'i18next-surrealdb-rest-backend';

i18next.use(Backend).init(i18nextOptions);
```

This library uses three methods listed in SurrealDB documentation:

- GET: `/key/:table/:id` - for fetching translations
- PATH: `/key/:table/:id` - for adding new translations for [saving missing keys](https://www.i18next.com/overview/configuration-options#missing-keys)
- PUT: `/key/:table/:id` - for creating new translations bundle (can be used as a caching layer)

Each time `:table` is in fact the `namespace` and `:id` is the `key` of the translation.

## Backend Options

```ts
{
  // path to database, checkout possible links [https://surrealdb.com/docs/integration/http]
  // e.g. if full path to GET is http://my-path.com/key/{{ns}}/{{lng}} you need to pass http://my-path.com
  // default: '/locales'
  path?: string,

  // name of namespace in which is the surreal database (nothing to do with i18next's namespaces)
  // default: 'ns'
  NS?: string,

  // name of surreal database
  // default: 'db'
  DB?: string,

  // authorization data to surreal database
  // by default Basic authentication is used
  auth?: { user: string; pass: string; }

  // custom additional headers to requests
  customHeaders?: HeadersInit;

  // custom additional fetch options
  requestOptions?: RequestInit;

  // custom fetch function
  // default: fetch.bind(window)
  customFetch?: typeof fetch;
}
```

Options can be passed in:

**preferred** - by setting options.backend in i18next.init:

```js
import i18next from 'i18next';
import Backend from 'i18next-surrealdb-rest-backend';

i18next.use(Backend).init({
  backend: options,
});
```

on construction:

```js
import Backend from 'i18next-surrealdb-rest-backend';

const backend = new Backend(null, options);
```

via calling init:

```js
import Backend from 'i18next-surrealdb-rest-backend';

const backend = new Backend();
backend.init(null, options);
```

## TypeScript

To properly type the backend options, you can import the `Options` type and use it as a generic type parameter to the i18next's `init` method, e.g.:

```ts
import i18n from 'i18next';
import Backend, { Options } from 'i18next-surrealdb-rest-backend';

i18n.use(Backend).init<Options>({
  backend: {
    // http backend options
  },

  // other i18next options
});
```

---
