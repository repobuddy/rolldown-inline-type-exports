import type { Plugin } from 'rolldown'
import { hoistExports } from './hoist-exports.ts'

// Workaround for https://github.com/rolldown/tsdown/issues/958
// rolldown emits `type X = ...` + trailing `export { X }` instead of `export type X = ...`.
// TypeScript 5.x treats these differently for TS2742 inference portability.
// This plugin rewrites trailing-export DTS files back to inline-export form.
export function inlineTypeExports(): Plugin {
	return {
		name: 'inline-type-exports',
		generateBundle(_, bundle) {
			for (const file of Object.values(bundle)) {
				const isDts = /\.d\.(m|c)?ts$/.test((file as { fileName?: string }).fileName ?? '')
				if (!isDts) continue
				if (file.type === 'asset' && typeof file.source === 'string') {
					file.source = hoistExports(file.source)
				} else if (file.type === 'chunk') {
					file.code = hoistExports(file.code)
				}
			}
		}
	}
}
