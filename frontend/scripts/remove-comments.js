// Enkel script för att ta bort kommentarer från en fil (stödjer TypeScript och JSX)
// Kommentarer och användarmeddelanden har översatts till svenska.
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

// Parsar koden och behåller positionsinformation så att vi kan
// räkna ut exakta teckenintervall för kommentarer och JSX-tomma uttryck.
function parseCodePreservingPositions(code) {
	return parser.parse(code, {
		sourceType: 'module',
		allowReturnOutsideFunction: true,
		plugins: [
			'typescript',
			'jsx'
		],
		errorRecovery: true,
		attachComment: true
	});
}

// Samlar intervall (start, end) som ska tas bort från koden.
// Hämta både AST-kommentarer och särskilda JSX-tomma uttryck som innehåller kommentarer.
function collectRemovalRanges(ast) {
	const ranges = [];

	// Lägg till vanliga parser-kommentarer om de finns
	if (Array.isArray(ast.comments)) {
		for (const comment of ast.comments) {
			if (typeof comment.start === 'number' && typeof comment.end === 'number') {
				ranges.push([comment.start, comment.end]);
			}
		}
	}

	// Enkel trädtraversering utan att följa kommentarfält så vi undviker dubbletter
	function traverse(node, visitor) {
		if (!node || typeof node !== 'object') return;
		if (Array.isArray(node)) {
			for (const child of node) traverse(child, visitor);
			return;
		}
		if (node.type) visitor(node);
		for (const key of Object.keys(node)) {
			if (key === 'loc' || key === 'leadingComments' || key === 'trailingComments' || key === 'innerComments') continue;
			const value = node[key];
			if (value && typeof value === 'object') traverse(value, visitor);
		}
	}

	// Sök efter JSXExpressionContainer som innehåller tomt uttryck med inre kommentarer
	traverse(ast, (node) => {
		if (
			node.type === 'JSXExpressionContainer' &&
			node.expression &&
			node.expression.type === 'JSXEmptyExpression' &&
			Array.isArray(node.expression.innerComments) &&
			node.expression.innerComments.length > 0 &&
			typeof node.start === 'number' &&
			typeof node.end === 'number'
		) {
			ranges.push([node.start, node.end]);
		}
	});

	// Sortera och slå ihop överlappande/intervaller som ligger intill varandra
	ranges.sort((a, b) => a[0] - b[0]);
	const merged = [];
	for (const range of ranges) {
		if (merged.length === 0) {
			merged.push([...range]);
			continue;
		}
		const last = merged[merged.length - 1];
		if (range[0] <= last[1]) {
			// Överlappande intervall -> slå ihop
			last[1] = Math.max(last[1], range[1]);
		} else if (range[0] === last[1] + 1) {
			// Intilliggande intervall -> slå ihop
			last[1] = range[1];
		} else {
			merged.push([...range]);
		}
	}
	return merged;
}

// Tar bort de angivna teckenintervallen från koden och returnerar den nya strängen.
function removeRangesFromCode(code, ranges) {
	if (!ranges || ranges.length === 0) return code;
	let result = '';
	let lastIndex = 0;
	for (const [start, end] of ranges) {
		result += code.slice(lastIndex, start);
		lastIndex = end;
	}
	result += code.slice(lastIndex);
	return result;
}

// Huvudfunktion: läs fil, analysera, ta bort kommentarer och spara en backup.
function main() {
	const targetArg = process.argv[2];
	if (!targetArg) {
		console.error('Användning: node scripts/remove-comments.js <relativ-sökväg-till-fil>');
		process.exit(1);
	}
	const targetPath = path.resolve(process.cwd(), targetArg);
	if (!fs.existsSync(targetPath)) {
		console.error(`Filen hittades inte: ${targetPath}`);
		process.exit(1);
	}

	const originalCode = fs.readFileSync(targetPath, 'utf8');
	const ast = parseCodePreservingPositions(originalCode);
	const ranges = collectRemovalRanges(ast);
	const withoutComments = removeRangesFromCode(originalCode, ranges);

	// Spara backup och skriv över originalfilen
	const backupPath = `${targetPath}.bak`;
	fs.writeFileSync(backupPath, originalCode, 'utf8');
	fs.writeFileSync(targetPath, withoutComments, 'utf8');
	console.log(`Kommentarer borttagna. Backup sparad till: ${backupPath}`);
}

main();


