import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {loadBranding} from '../main/branding.js';

test('loadBranding applies defaults and overlays local branding values', () =>
{
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drawapp-branding-'));

	try
	{
		fs.writeFileSync(path.join(dir, 'branding.json'), JSON.stringify({
			appName: 'Configured App',
			logoUrl: 'https://example.com/logo.png',
			uiVersion: '2.4.0'
		}));
		fs.writeFileSync(path.join(dir, 'branding.local.json'), JSON.stringify({
			appName: 'Local App',
			uiVersion: '2.4.1-dev',
			repositoryUrl: 'javascript:alert(1)',
			logoUrl: 'file:///tmp/logo.png'
		}));

		const branding = loadBranding(dir);
		assert.equal(branding.appName, 'Local App');
		assert.equal(branding.description, 'Local App desktop diagram editor');
		assert.equal(branding.uiVersion, '2.4.1-dev');
		assert.equal(branding.logoUrl, null);
		assert.equal(branding.repositoryUrl, 'https://github.com/imrsp/drawapp-minimal');
		assert.match(branding.copyright, /Local App contributors$/);
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
		fs.writeFileSync(path.join(dir, 'branding.json'), '{not json');
		const branding = loadBranding(dir);
		assert.equal(branding.appName, 'DrawApp');
		assert.equal(branding.logoUrl, null);
		assert.equal(branding.uiVersion, null);
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
		fs.writeFileSync(path.join(dir, 'branding.json'), JSON.stringify({logoUrl: 'images/electron-logo.svg'}));
		assert.equal(loadBranding(dir).logoUrl, 'images/electron-logo.svg');
		fs.writeFileSync(path.join(dir, 'branding.json'), JSON.stringify({logoUrl: 'images/../logo.svg'}));
		assert.equal(loadBranding(dir).logoUrl, null);
	}
	finally
	{
		fs.rmSync(dir, {recursive: true, force: true});
	}
});
