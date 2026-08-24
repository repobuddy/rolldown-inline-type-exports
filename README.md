# rolldown-inline-type-exports

Monorepo for [`@repobuddy/rolldown-inline-type-exports`](packages/rolldown-inline-type-exports).

## Commands

```sh
pnpm install
pnpm verify          # knip + build + lint + test
pnpm plugin build    # build the plugin package
pnpm cs              # changeset CLI
pnpm release         # publish to npm (requires npm OTP)
```

## Publish

From `packages/rolldown-inline-type-exports` after `pnpm plugin build`:

```sh
npm publish --access public --otp=<code>
```

Then switch tersify (and other consumers) from `link:` to `^1.0.0`.

## License

MIT
