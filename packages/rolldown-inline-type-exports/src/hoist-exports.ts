function escRe(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function hasLocalDecl(code: string, name: string): boolean {
	const e = escRe(name)
	return (
		new RegExp(`^type ${e}\\b`, 'm').test(code) ||
		new RegExp(`^interface ${e}\\b`, 'm').test(code) ||
		new RegExp(`^declare (?:(?:abstract )?class|function|const|let|var|enum) ${e}\\b`, 'm').test(code)
	)
}

export function hoistExports(code: string): string {
	const match = code.match(/^export(?:\s+type)?\s*\{([^}]+)\};?$/m)
	if (!match) return code

	const names = match[1]
		.split(',')
		.map(n => n.trim().replace(/^type\s+/, ''))
		.filter(Boolean)

	const toInline = names.filter(n => hasLocalDecl(code, n))
	if (toInline.length === 0) return code

	let out = code
	for (const name of toInline) {
		const e = escRe(name)
		out = out.replace(new RegExp(`^(type ${e}\\b)`, 'm'), 'export $1')
		out = out.replace(new RegExp(`^(interface ${e}\\b)`, 'm'), 'export $1')
		out = out.replace(
			new RegExp(`^(declare (?:(?:abstract )?class|function|const|let|var|enum) ${e}\\b)`, 'm'),
			'export $1'
		)
	}

	const remaining = names.filter(n => !toInline.includes(n))
	if (remaining.length === 0) {
		out = out.replace(/^export(?:\s+type)?\s*\{[^}]+\};?\s*$/m, '')
	} else {
		out = out.replace(/^export(?:\s+type)?\s*\{[^}]+\};?$/m, `export { ${remaining.join(', ')} };`)
	}

	return out
}
