import fs from 'fs';
import path from 'path';
import {normalizeLibrarySettings} from './libraries.js';

const DEFAULT_BRANDING = Object.freeze({
	appName: 'DrawApp',
	description: null,
	uiVersion: null,
	logoUrl: 'branding/logo.png',
	logoScale: Object.freeze({header: 1, about: 1, splash: 1}),
	aboutHtml: '',
	repositoryUrl: 'https://github.com/imrsp/drawapp-minimal',
	repositoryLabel: 'imrsp/drawapp-minimal',
	copyright: null
});

const DEFAULT_PACKAGING = Object.freeze({
	appId: 'org.drawapp.minimal',
	packageName: 'drawapp-minimal',
	executableName: 'drawapp-minimal',
	author: 'drawapp-minimal contributors',
	outputDirectory: './dist/',
	artifactNames: {},
	macCategory: 'public.app-category.graphics-design',
	linuxCategory: 'Graphics',
	linuxMaintainer: 'drawapp-minimal contributors',
	appx: {},
	fileAssociations: []
});

function cleanString(value, fallback, maxLength = 200)
{
	return typeof value === 'string' && value.trim() ? value.trim().slice(0, maxLength) : fallback;
}

function cleanPackageName(value)
{
	const packageName = cleanString(value, DEFAULT_PACKAGING.packageName, 100);
	return /^[a-z0-9][a-z0-9._-]*$/i.test(packageName) && packageName !== '.' && packageName !== '..' ?
		packageName : DEFAULT_PACKAGING.packageName;
}

function cleanLogoScale(value)
{
	const scale = Number(value);
	return Number.isFinite(scale) && scale >= 0.25 && scale <= 2 ? scale : 1;
}

function normalizeBranding(value = {})
{
	const appName = cleanString(value.appName, DEFAULT_BRANDING.appName);
	const requestedLogoUrl = typeof value.logoUrl === 'string' ? value.logoUrl.trim() : '';
	const logoUrl = /^https?:\/\//i.test(requestedLogoUrl) || /^branding\/[a-z0-9._-]+\.(?:png|svg)$/i.test(requestedLogoUrl) ?
		requestedLogoUrl.slice(0, 2048) : DEFAULT_BRANDING.logoUrl;
	const uiVersion = typeof value.uiVersion === 'string' && value.uiVersion.trim() ?
		value.uiVersion.trim().slice(0, 80) : null;
	const repositoryUrl = cleanString(value.repositoryUrl, DEFAULT_BRANDING.repositoryUrl, 2048);
	const requestedLogoScale = value.logoScale != null && typeof value.logoScale === 'object' && !Array.isArray(value.logoScale) ?
		value.logoScale : {};
	const logoScale = Object.freeze({
		header: cleanLogoScale(requestedLogoScale.header),
		about: cleanLogoScale(requestedLogoScale.about),
		splash: cleanLogoScale(requestedLogoScale.splash)
	});
	return Object.freeze({
		appName,
		description: cleanString(value.description, `${appName} desktop diagram editor`),
		uiVersion,
		logoUrl,
		logoScale,
		aboutHtml: typeof value.aboutHtml === 'string' ? value.aboutHtml.slice(0, 20000) : DEFAULT_BRANDING.aboutHtml,
		repositoryUrl: /^https?:\/\//i.test(repositoryUrl) ? repositoryUrl : DEFAULT_BRANDING.repositoryUrl,
		repositoryLabel: cleanString(value.repositoryLabel, DEFAULT_BRANDING.repositoryLabel),
		copyright: cleanString(value.copyright, `Copyright ${new Date().getFullYear()} ${appName} contributors`)
	});
}

function readJson(filePath)
{
	try
	{
		return JSON.parse(fs.readFileSync(filePath, 'utf8'));
	}
	catch (e)
	{
		if (e.code !== 'ENOENT') console.warn(`Unable to read application configuration ${filePath}:`, e.message);
		return {};
	}
}

export function loadAppConfig(configDir)
{
	const raw = readJson(path.join(configDir, 'app.json'));
	const packaging = raw.packaging != null && typeof raw.packaging === 'object' && !Array.isArray(raw.packaging) ?
		raw.packaging : {};
	return Object.freeze({
		branding: normalizeBranding(raw),
		packaging: Object.freeze({...DEFAULT_PACKAGING, ...packaging, packageName: cleanPackageName(packaging.packageName)}),
		libraries: normalizeLibrarySettings(raw.libraries)
	});
}

export function loadBranding(configDir)
{
	return loadAppConfig(configDir).branding;
}

export {DEFAULT_BRANDING, DEFAULT_PACKAGING};
