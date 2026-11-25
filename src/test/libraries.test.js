import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {loadAppConfig} from '../main/branding.js';
import {
	createEditorLibraryConfig,
	getBuiltInLibraryResources,
	getLibraryFilePatterns,
	normalizeLibrarySettings,
	validateCustomLibraries,
	validateMxlibraryXml
} from '../main/libraries.js';

const projectDir = path.resolve(import.meta.dirname, '../..');

test('library settings default to the editor current built-in libraries', () =>
{
	const {libraries} = loadAppConfig(path.join(projectDir, 'config'));
	assert.deepEqual(libraries.builtIn.included,
		['general', 'uml', 'er', 'bpmn', 'flowchart', 'basic', 'arrows2']);
	assert.deepEqual(libraries.builtIn.default, libraries.builtIn.included);
});

test('default libraries must be included in the package', () =>
{
	assert.throws(() => normalizeLibrarySettings({
		builtIn: {included: ['general'], default: ['uml']}
	}), /must also be included/);
});

test('mxlibrary XML is checked and entries are parsed', () =>
{
	const entries = validateMxlibraryXml(
		'<mxlibrary title="Example">[{"w":120,"h":60,"xml":"&lt;mxGraphModel/&gt;"}]</mxlibrary>');
	assert.equal(entries.length, 1);
	assert.equal(entries[0].xml, '<mxGraphModel/>');
	assert.throws(() => validateMxlibraryXml('<mxfile></mxfile>', 'wrong.xml'), /<mxlibrary>/);
	assert.throws(() => validateMxlibraryXml('<mxlibrary>{}</mxlibrary>', 'wrong.json'), /JSON array/);
	assert.throws(() => validateMxlibraryXml('<mxlibrary>[{"w":10}]</mxlibrary>', 'bad-entry.xml'), /entry 1/);
});

test('custom library files must exist under config/mxlib and be valid', () =>
{
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'drawapp-libraries-'));
	const configDir = path.join(root, 'config');
	const mxlibDir = path.join(configDir, 'mxlib');
	fs.mkdirSync(mxlibDir, {recursive: true});
	fs.writeFileSync(path.join(mxlibDir, 'company.xml'), '<mxlibrary>[]</mxlibrary>');

	try
	{
		const libraries = normalizeLibrarySettings({custom: ['company.xml']});
		assert.equal(validateCustomLibraries(configDir, libraries)[0].relativePath, 'company.xml');
		assert.throws(() => validateCustomLibraries(configDir,
			normalizeLibrarySettings({custom: ['missing.xml']})), /not found/);
		fs.writeFileSync(path.join(mxlibDir, 'invalid.xml'), '<mxfile/>');
		assert.throws(() => validateCustomLibraries(configDir,
			normalizeLibrarySettings({custom: ['invalid.xml']})), /<mxlibrary>/);
		assert.throws(() => normalizeLibrarySettings({custom: ['../outside.xml']}), /Invalid custom library path/);
	}
	finally
	{
		fs.rmSync(root, {recursive: true, force: true});
	}
});

test('editor config uses package availability and packaged custom library paths', () =>
{
	const libraries = normalizeLibrarySettings({
		builtIn: {included: ['general', 'flowchart'], default: ['general']},
		custom: ['company.xml']
	});
	const editorConfig = createEditorLibraryConfig(libraries, '/tmp/drawapp.asar');
	assert.deepEqual(editorConfig.enabledLibraries, ['general', 'flowchart']);
	assert.equal(editorConfig.defaultLibraries, 'general');
	assert.match(decodeURIComponent(editorConfig.defaultCustomLibraries[0]), /^Sfile:\/\/\/tmp\/drawapp\.asar\/config\/mxlib\/company\.xml$/);
});

test('built-in library resource selection follows the editor registry', () =>
{
	const resources = getBuiltInLibraryResources(projectDir, ['arrows2', 'flowchart']);
	assert.ok(resources.includes('shapes/mxArrows.js'));
	assert.ok(resources.includes('shapes/mxFlowchart.js'));
	assert.ok(!resources.includes('shapes/mxAWS3D.js'));
});

test('all platform templates can re-include selected resources after broad exclusions', () =>
{
	const resources = getBuiltInLibraryResources(projectDir, ['arrows2']);
	const patterns = getLibraryFilePatterns([{relativePath: 'company.xml'}], resources);
	const templateFiles = fs.readdirSync(projectDir)
		.filter(file => /^electron-builder-.*\.json$/.test(file));
	assert.ok(templateFiles.length > 0);

	for (const templateFile of templateFiles)
	{
		const template = JSON.parse(fs.readFileSync(path.join(projectDir, templateFile), 'utf8'));
		assert.ok(template.files.includes('!drawio/src/main/webapp/shapes{,/**}'));
		assert.ok(template.files.includes('!drawio/src/main/webapp/stencils/**/*.xml'));
		assert.ok(patterns.includes('config/mxlib/company.xml'));
		assert.ok(patterns.includes('drawio/src/main/webapp/shapes/mxArrows.js'));
		assert.ok(!patterns.includes('drawio/src/main/webapp/shapes/mxAWS3D.js'));
	}
});
