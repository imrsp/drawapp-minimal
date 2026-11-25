import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {loadBranding} from '../main/branding.js';

test('loadBranding reads the unified application configuration', () =>
{
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drawapp-branding-'));

	try
	{
		fs.writeFileSync(path.join(dir, 'app.json'), JSON.stringify({
			appName: 'Configured App',
			logoUrl: 'https://example.com/logo.png',
			uiVersion: '2.4.0',
			copyright: 'Copyright 2025 Custom Team'
		}));

		const branding = loadBranding(dir);
		assert.equal(branding.appName, 'Configured App');
		assert.equal(branding.description, 'Configured App desktop diagram editor');
		assert.equal(branding.uiVersion, '2.4.0');
		assert.equal(branding.copyright, 'Copyright 2025 Custom Team');
		assert.equal(branding.logoUrl, 'https://example.com/logo.png');
		assert.equal(branding.repositoryUrl, 'https://github.com/imrsp/drawapp-minimal');
	}
	finally
	{
		fs.rmSync(dir, {recursive: true, force: true});
	}
});

test('loadBranding falls back cleanly when config files are missing or malformed', () =>
{
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drawapp-branding-'));

	try
	{
		fs.writeFileSync(path.join(dir, 'app.json'), '{not json');
		const branding = loadBranding(dir);
		assert.equal(branding.appName, 'DrawApp');
		assert.equal(branding.logoUrl, 'branding/logo.png');
		assert.equal(branding.uiVersion, null);
		assert.match(branding.copyright, new RegExp(`^Copyright ${new Date().getFullYear()} DrawApp contributors$`));
	}
	finally
	{
		fs.rmSync(dir, {recursive: true, force: true});
	}
});

test('loadBranding accepts bundled app logos but rejects unsafe relative paths', () =>
{
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drawapp-branding-'));

	try
	{
		fs.writeFileSync(path.join(dir, 'app.json'), JSON.stringify({logoUrl: 'images/electron-logo.svg'}));
		assert.equal(loadBranding(dir).logoUrl, 'branding/logo.png');
		fs.writeFileSync(path.join(dir, 'app.json'), JSON.stringify({logoUrl: 'images/../logo.svg'}));
		assert.equal(loadBranding(dir).logoUrl, 'branding/logo.png');
	}
	finally
	{
		fs.rmSync(dir, {recursive: true, force: true});
	}
});
