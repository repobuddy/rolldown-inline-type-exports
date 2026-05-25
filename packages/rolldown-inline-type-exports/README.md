# @repobuddy/rolldown-inline-type-exports

Rolldown plugin that rewrites trailing type exports in `.d.ts` / `.d.mts` / `.d.cts` files back to inline `export type` form.

## Problem

[rolldown/tsdown#958](https://github.com/rolldown/tsdown/issues/958): tsdown may emit:

```ts
type TersifyOptions = ...
type Tersible<T = unknown> = ...
export { Tersible, TersifyOptions }
```

Downstream consumers can hit `TS2742` ("The inferred type of 'foo' cannot be named without a reference to '.../types.mjs'") when re-exporting inferred return types. Inline exports avoid this:

```ts
export type TersifyOptions = ...
export type Tersible<T = unknown> = ...
```

## Usage

```ts
import { defineConfig } from 'tsdown'
import { inlineTypeExports } from '@repobuddy/rolldown-inline-type-exports'

export default defineConfig({
  dts: true,
  plugins: [inlineTypeExports()],
})
```

## Upstream

This plugin is a workaround until [rolldown-plugin-dts#202](https://github.com/sxzz/rolldown-plugin-dts/issues/202) is fixed. It may be deprecated once upstream emits inline exports by default.

## License

MIT
