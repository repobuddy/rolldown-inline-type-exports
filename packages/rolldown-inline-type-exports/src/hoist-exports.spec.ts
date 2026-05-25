import { describe, expect, it } from 'vitest'
import { hoistExports } from './hoist-exports.ts'

describe('hoistExports', () => {
	it('inlines type alias with export { X }', () => {
		const input = `type TersifyOptions = {
  raw?: boolean
}

type Tersible<T = unknown> = T & {
  tersify(options?: Partial<TersifyOptions>): string
}

export { Tersible, TersifyOptions }
`
		const expected = `export type TersifyOptions = {
  raw?: boolean
}

export type Tersible<T = unknown> = T & {
  tersify(options?: Partial<TersifyOptions>): string
}

`
		expect(hoistExports(input)).toBe(expected)
	})

	it('inlines type alias with export type { X }', () => {
		const input = `type Foo = string

export type { Foo }
`
		expect(hoistExports(input)).toBe('export type Foo = string\n\n')
	})

	it('inlines interface declarations', () => {
		const input = `interface Options {
  raw?: boolean
}

export { Options }
`
		expect(hoistExports(input)).toBe(`export interface Options {
  raw?: boolean
}

`)
	})

	it('inlines declare class declarations', () => {
		const input = `declare class Foo {}

export { Foo }
`
		expect(hoistExports(input)).toBe('export declare class Foo {}\n\n')
	})

	it('keeps re-exported symbols that have no local declaration', () => {
		const input = `type Local = string

export { Local, External }
`
		expect(hoistExports(input)).toBe(`export type Local = string

export { External };
`)
	})

	it('returns code unchanged when there is no trailing export block', () => {
		const input = `export type Foo = string
export interface Bar {}
`
		expect(hoistExports(input)).toBe(input)
	})

	it('returns code unchanged when trailing export has no local declarations', () => {
		const input = `export { External }
`
		expect(hoistExports(input)).toBe(input)
	})
})
