# @alepop/stencil-env

This package is used to use env variables from `.env` file and to load env vars from Vault secrets. Your `.env` must include the following: 
```
CRDS_ENV=local
VAULT_ROLE_ID=
VAULT_SECRET_ID=
```

CRDS_ENV should be either `local`, `int`, or `prod`.

First, npm install within the project:

```
npm install @alepop/stencil-env --save-dev
```

Next, within the project's `stencil.config.js` file, import the plugin and add
it to the `plugins` config.

#### stencil.config.ts
```ts
import { Config } from '@stencil/core';
import { env } from 'rollup-plugin-vault';

export const config: Config = {
  plugins: [
      env({ secrets: ['common', 'components'], vaultUrl: 'https://vault.crossroads.net/', secretFolder: 'kv-client' })
  ]
};
```
You can pass other secret folders in the array of strings as well such as `components` etc.

Add `.env` file in the root of your project

### .env
```bash
TEST=test string
```

After compilation, `process.env.TEST` will be replaced by it variable from `.env` file.

## Related

* [Stencil](https://stenciljs.com/)
* [Stencil Worldwide Slack](https://stencil-worldwide.slack.com)
* [dotenv](https://github.com/motdotla/dotenv)
