export type RequiredOptions = {
  path: string;
  NS: string;
  DB: string;
  auth?: {
    user: string;
    pass: string;
  };
  customHeaders?: HeadersInit;
  requestOptions?: RequestInit;
};

export type Options = Partial<RequiredOptions>;

export const defaultOptions: RequiredOptions = {
  path: '/locales',
  NS: 'ns',
  DB: 'db',
};
