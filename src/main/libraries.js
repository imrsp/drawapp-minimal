import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const DEFAULT_BUILT_IN_LIBRARIES = Object.freeze([
	'general', 'misc', 'advanced', 'uml', 'er', 'bpmn', 'flowchart', 'basic', 'arrows2'
]);

export const DEFAULT_MORE_SHAPES_ORDER = Object.freeze(['custom', 'builtIn']);

const LIBRARY_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

function uniqueStrings(value, fieldName)
{
	if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !LIBRARY_ID_PATTERN.test(item)))
	{
		throw new Error(`libraries.${fieldName} must be an array of valid library IDs`);
	}

	return [...new Set(value)];
}

export function normalizeLibrarySettings(value = {})
{
	if (value == null || typeof value !== 'object' || Array.isArray(value))
	{
		throw new Error('libraries must be an object');
	}

	const builtIn = value.builtIn == null ? {} : value.builtIn;
	if (typeof builtIn !== 'object' || Array.isArray(builtIn))
	{
		throw new Error('libraries.builtIn must be an object');
	}

	const included = uniqueStrings(builtIn.included ?? DEFAULT_BUILT_IN_LIBRARIES,
		'builtIn.included');
	const defaults = uniqueStrings(builtIn.default ?? DEFAULT_BUILT_IN_LIBRARIES,
		'builtIn.default');
	const unavailableDefaults = defaults.filter(id => !included.includes(id));
	if (unavailableDefaults.length > 0)
	{
		throw new Error(`Default libraries must also be included in the package: ${unavailableDefaults.join(', ')}`);
	}
	const moreShapesOrder = value.moreShapesOrder ?? DEFAULT_MORE_SHAPES_ORDER;
	if (!Array.isArray(moreShapesOrder) || moreShapesOrder.length !== 2 ||
		new Set(moreShapesOrder).size !== 2 ||
		moreShapesOrder.some(section => section !== 'builtIn' && section !== 'custom'))
	{
		throw new Error('libraries.moreShapesOrder must contain "builtIn" and "custom" exactly once');
	}

	const custom = value.custom ?? [];
	if (!Array.isArray(custom) || custom.some(file => typeof file !== 'string'))
	{
		throw new Error('libraries.custom must be an array of paths relative to config/mxlib');
	}

	const customFiles = [...new Set(custom)];
	for (const file of customFiles)
	{
		if (!file || path.isAbsolute(file) || file.includes('\\') ||
			!file.toLowerCase().endsWith('.xml') ||
			file.split('/').some(part => !part || part === '.' || part === '..'))
		{
			throw new Error(`Invalid custom library path "${file}". Use an .xml path relative to config/mxlib.`);
		}
	}

	return Object.freeze({
		builtIn: Object.freeze({included: Object.freeze(included), default: Object.freeze(defaults)}),
		custom: Object.freeze(customFiles),
		moreShapesOrder: Object.freeze([...moreShapesOrder])
	});
}

function decodeXmlText(value)
{
	return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (entity, code) =>
	{
		if (code[0] === '#')
		{
			const hex = code[1]?.toLowerCase() === 'x';
			const point = Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
			return Number.isFinite(point) ? String.fromCodePoint(point) : entity;
		}

		return {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'"}[code.toLowerCase()];
	});
}

export function validateMxlibraryXml(xml, filename = 'custom library')
{
	if (typeof xml !== 'string') throw new Error(`${filename}: expected XML text`);
	const match = xml.replace(/^\uFEFF/, '').match(/^\s*(?:<\?xml[^?]*\?>\s*)?<mxlibrary(?:\s[^>]*)?>([\s\S]*)<\/mxlibrary>\s*$/i);
	if (!match)
	{
		throw new Error(`${filename}: expected a draw.io <mxlibrary> XML document`);
	}

	let entries;
	try
	{
		entries = JSON.parse(decodeXmlText(match[1]));
	}
	catch (error)
	{
		throw new Error(`${filename}: invalid JSON inside <mxlibrary>: ${error.message}`);
	}

	if (!Array.isArray(entries))
	{
		throw new Error(`${filename}: <mxlibrary> content must be a JSON array`);
	}

	for (let index = 0; index < entries.length; index++)
	{
		const entry = entries[index];
		if (entry == null || typeof entry !== 'object' || Array.isArray(entry) ||
			!Number.isFinite(Number(entry.w)) || Number(entry.w) <= 0 ||
			!Number.isFinite(Number(entry.h)) || Number(entry.h) <= 0 ||
			(typeof entry.xml !== 'string' && typeof entry.data !== 'string'))
		{
			throw new Error(`${filename}: entry ${index + 1} needs w, h, and either xml or data`);
		}
	}

	return entries;
}

export function validateCustomLibraries(configDir, libraries)
{
	const mxlibDir = path.resolve(configDir, 'mxlib');
	return libraries.custom.map(relativePath =>
	{
		const filePath = path.resolve(mxlibDir, ...relativePath.split('/'));
		if (filePath !== mxlibDir && !filePath.startsWith(mxlibDir + path.sep))
		{
			throw new Error(`Custom library path escapes config/mxlib: ${relativePath}`);
		}

		if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile())
		{
			throw new Error(`Custom library not found: config/mxlib/${relativePath}`);
		}

		const realMxlibDir = fs.realpathSync(mxlibDir);
		const realFilePath = fs.realpathSync(filePath);
		if (realFilePath !== realMxlibDir && !realFilePath.startsWith(realMxlibDir + path.sep))
		{
			throw new Error(`Custom library path escapes config/mxlib: ${relativePath}`);
		}

		validateMxlibraryXml(fs.readFileSync(filePath, 'utf8'), `config/mxlib/${relativePath}`);
		return {relativePath, filePath};
	});
}

export function createEditorLibraryConfig(libraries, appBaseDir)
{
	const customLibraries = libraries.custom.map(relativePath =>
	{
		const fileUrl = pathToFileURL(path.join(appBaseDir, 'config', 'mxlib', ...relativePath.split('/'))).href;
		return {
			id: `S${encodeURIComponent(fileUrl)}`,
			title: path.posix.basename(relativePath).replace(/\.xml$/i, '')
		};
	});

	return {
		enabledLibraries: [...libraries.builtIn.included],
		defaultLibraries: libraries.builtIn.default.join(';'),
		defaultCustomLibraries: customLibraries.map(library => library.id),
		managedCustomLibraries: customLibraries,
		moreShapesOrder: [...libraries.moreShapesOrder]
	};
}

export function getLibraryFilePatterns(customLibraries, libraryResources)
{
	return [
		...customLibraries.map(({relativePath}) => `config/mxlib/${relativePath}`),
		...libraryResources.map(resource => `drawio/src/main/webapp/${resource}`)
	];
}

export function getBuiltInLibraryResources(rootDir, libraryIds)
{
	const webappDir = path.join(rootDir, 'drawio', 'src', 'main', 'webapp');
	const editorSource = fs.readFileSync(path.join(webappDir, 'js', 'diagramly', 'Editor.js'), 'utf8');
	const sidebarSource = fs.readFileSync(path.join(webappDir, 'js', 'diagramly', 'sidebar', 'Sidebar.js'), 'utf8');
	const aliasMatch = sidebarSource.match(/Sidebar\.prototype\.libAliases\s*=\s*\{([^}]*)\}/);
	const aliases = Object.fromEntries([...(aliasMatch?.[1] || '').matchAll(/'([^']+)'\s*:\s*'([^']+)'/g)]
		.map(([, from, to]) => [from, to]));
	const registry = new Map();
	const registrationPattern = /mxStencilRegistry\.libraries\[['"]([^'"]+)['"]\]\s*=\s*\[([^\]]*)\]/g;
	let match;

	while ((match = registrationPattern.exec(editorSource)) != null)
	{
		const paths = [...match[2].matchAll(/(SHAPES_PATH|STENCIL_PATH)\s*\+\s*['"]\/([^'"]+)['"]/g)]
			.map(([, base, resource]) => `${base === 'SHAPES_PATH' ? 'shapes' : 'stencils'}/${resource}`);
		registry.set(match[1], paths);
	}

	const resources = new Set();
	for (const id of libraryIds)
	{
		const names = new Set([id, aliases[id]]);
		for (const [name, paths] of registry)
		{
			if ([...names].some(prefix => prefix &&
				(name === prefix || name.startsWith(prefix + '/'))))
			{
				for (const resource of paths)
				{
					if (fs.existsSync(path.join(webappDir, resource))) resources.add(resource);
				}
			}
		}

		for (const prefix of names)
		{
			if (!prefix) continue;
			const stencilDir = path.join(webappDir, 'stencils', prefix);
			const shapeDir = path.join(webappDir, 'shapes', prefix);
			const stencilFile = path.join(webappDir, 'stencils', `${prefix}.xml`);
			if (fs.existsSync(stencilFile)) resources.add(path.relative(webappDir, stencilFile).split(path.sep).join('/'));
			for (const dir of [stencilDir, shapeDir])
			{
				if (fs.existsSync(dir))
				{
					for (const file of walkFiles(dir))
					{
						resources.add(path.relative(webappDir, file).split(path.sep).join('/'));
					}
				}
			}
		}
	}

	return [...resources].sort();
}

function* walkFiles(dir)
{
	for (const entry of fs.readdirSync(dir, {withFileTypes: true}))
	{
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) yield* walkFiles(fullPath);
		else if (entry.isFile()) yield fullPath;
	}
}
