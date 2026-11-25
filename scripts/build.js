import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import {loadAppConfig} from '../src/main/branding.js';
import {getBuiltInLibraryResources, getLibraryFilePatterns, validateCustomLibraries} from '../src/main/libraries.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configDir = path.join(rootDir, 'config');
const generatedDir = path.join(rootDir, '.build');
const iconDir = path.join(generatedDir, 'icons');
const targets = {
	mac: {config: 'electron-builder-linux-mac.json', args: ['--mac', 'dir']},
	win: {config: 'electron-builder-win.json', args: []},
	winArm64: {config: 'electron-builder-win-arm64.json', args: []},
	appx: {config: 'electron-builder-appx.json', args: []},
	linux: {config: 'electron-builder-linux-mac.json', args: ['--linux']},
	snap: {config: 'electron-builder-snap.json', args: []}
};

const targetName = process.argv[2];
const target = targets[targetName];
const {branding, packaging, libraries} = loadAppConfig(configDir);

if (targetName === 'icons')
{
	await generateIcons(branding.logoUrl);
	process.exit(0);
}

if (target == null)
{
	console.error(`Unknown build target "${targetName || ''}". Choose one of: ${[...Object.keys(targets), 'icons'].join(', ')}`);
	process.exit(2);
}

if (targetName === 'mac' && process.platform !== 'darwin')
{
	throw new Error('The macOS build requires macOS so iconutil can create the ICNS asset.');
}

const customLibraries = validateCustomLibraries(configDir, libraries);
const libraryResources = getBuiltInLibraryResources(rootDir, libraries.builtIn.included);
await generateIcons(branding.logoUrl);
const builderConfig = makeBuilderConfig(targetName, target.config, branding, packaging,
	customLibraries, libraryResources);
const builderConfigPath = path.join(generatedDir, 'electron-builder', `${targetName}.json`);
fs.mkdirSync(path.dirname(builderConfigPath), {recursive: true});
fs.writeFileSync(builderConfigPath, JSON.stringify(builderConfig, null, 2));

const executable = process.platform === 'win32' ?
	path.join(rootDir, 'node_modules', '.bin', 'electron-builder.cmd') :
	path.join(rootDir, 'node_modules', '.bin', 'electron-builder');
const result = spawnSync(executable, [
	'--config', builderConfigPath,
	...target.args,
	'--publish', 'never',
	...process.argv.slice(3)
], {
	cwd: rootDir,
	stdio: 'inherit',
	shell: process.platform === 'win32'
});

if (result.error)
{
	console.error(result.error.message);
	process.exit(1);
}

process.exit(result.status ?? 1);

function makeBuilderConfig(targetName, configFile, branding, packaging, customLibraries = [], libraryResources = [])
{
	const config = JSON.parse(fs.readFileSync(path.join(rootDir, configFile), 'utf8'));
	const productName = branding.appName.replace(/[\\/:*?"<>|]/g, '-').trim() || 'drawapp-minimal';
	const icons = iconDir;
	const isMac = targetName === 'mac';
	const isLinux = targetName === 'linux' || targetName === 'snap';
	if (!isMac) delete config.mac;
	if (!isLinux) delete config.linux;

	config.appId = packaging.appId;
	config.copyright = branding.copyright;
	config.productName = productName;
	config.artifactName = packaging.artifactNames.default;
	config.extraMetadata = {
		...config.extraMetadata,
		description: branding.description,
		author: packaging.author
	};
	config.directories = {...config.directories, output: packaging.outputDirectory};
	config.fileAssociations = isMac ? [] :
		packaging.fileAssociations.map(({macConformsTo, ...association}) => association);
	config.files.push('config/app.json', ...getLibraryFilePatterns(customLibraries, libraryResources),
		'!.build{,/**}');

	if (isMac)
	{
		config.mac.icon = icons;
		config.mac.category = packaging.macCategory;
		config.mac.extendInfo = config.mac.extendInfo || {};
		const macTypes = packaging.fileAssociations.map((association, index) =>
		{
			const extensions = Array.isArray(association.ext) ? association.ext : [association.ext];
			const typeId = `${packaging.appId}.document${index + 1}`;
			return {
				typeId,
				extensions,
				name: association.description,
				mimeType: association.mimeType,
				conformsTo: association.macConformsTo || ['public.data']
			};
		});
		config.mac.extendInfo.UTExportedTypeDeclarations = macTypes.map(type => ({
			UTTypeIdentifier: type.typeId,
			UTTypeDescription: type.name,
			UTTypeConformsTo: type.conformsTo,
			UTTypeTagSpecification: {
				'public.filename-extension': type.extensions,
				'public.mime-type': [type.mimeType]
			}
		}));
		config.mac.extendInfo.CFBundleDocumentTypes = macTypes.map((type, index) => ({
			CFBundleTypeExtensions: type.extensions,
			CFBundleTypeName: type.name,
			CFBundleTypeRole: 'Editor',
			CFBundleTypeIconFile: 'icon.icns',
			LSItemContentTypes: [type.typeId],
			LSHandlerRank: index === 0 ? 'Owner' : 'Default'
		}));
	}

	if (config.win != null)
	{
		config.win.icon = path.join(icons, 'icon.ico');
	}

	if (isLinux && config.linux != null)
	{
		config.linux.icon = icons;
		config.linux.executableName = packaging.executableName;
		config.linux.category = packaging.linuxCategory;
		config.linux.maintainer = packaging.linuxMaintainer;
		config.linux.desktop.entry.StartupWMClass = packaging.executableName;
	}

	if (config.nsis != null)
	{
		config.nsis.artifactName = packaging.artifactNames.windowsInstaller;
	}
	if (config.msi != null)
	{
		config.msi.artifactName = packaging.artifactNames.windowsPackage;
	}
	if (config.portable != null)
	{
		config.portable.artifactName = packaging.artifactNames.windowsArm64Portable;
	}
	if (targetName === 'appx')
	{
		config.win.icon = icons;
		config.appx = {
			displayName: productName,
			publisherDisplayName: productName,
			...packaging.appx
		};
	}
	if (config.nsis != null && config.win.target.some(item => item.target === 'nsis' && item.arch.includes('arm64')))
	{
		config.nsis.artifactName = packaging.artifactNames.windowsArm64Installer;
	}

	return config;
}

async function generateIcons(logoUrl)
{
	if (!logoUrl || /^https?:\/\//i.test(logoUrl))
	{
		throw new Error('Icon generation requires a bundled logoUrl such as branding/logo.png');
	}

	const sourcePath = path.join(configDir, logoUrl);
	if (!fs.existsSync(sourcePath)) throw new Error(`Configured logo not found: ${sourcePath}`);
	const sharpModule = await import('sharp');
	const sharp = sharpModule.default;
	fs.rmSync(iconDir, {recursive: true, force: true});
	fs.mkdirSync(path.join(iconDir, 'appx'), {recursive: true});

	const icon = await sharp(sourcePath)
		.resize(1024, 1024, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}})
		.png()
		.toBuffer();
	for (const size of [16, 32, 48, 64, 96, 128, 192, 256, 512, 720, 1024])
	{
		await sharp(icon).resize(size, size).png().toFile(path.join(iconDir, `${size}x${size}.png`));
	}
	await sharp(icon).png().toFile(path.join(iconDir, 'icon.png'));
	await Promise.all([
		sharp(icon).resize(256, 256).png().toFile(path.join(iconDir, 'appx', 'LargeTile.png')),
		sharp(icon).resize(150, 150).png().toFile(path.join(iconDir, 'appx', 'Square150x150Logo.png')),
		sharp(icon).resize(44, 44).png().toFile(path.join(iconDir, 'appx', 'Square44x44Logo.png')),
		sharp(icon).resize(50, 50).png().toFile(path.join(iconDir, 'appx', 'StoreLogo.png')),
		sharp(icon).resize(24, 24).png().toFile(path.join(iconDir, 'appx', 'BadgeLogo.png')),
		sharp(icon).resize(71, 71).png().toFile(path.join(iconDir, 'appx', 'SmallTile.png')),
		sharp(icon).resize(310, 150, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}})
			.png().toFile(path.join(iconDir, 'appx', 'Wide310x150Logo.png'))
	]);
	fs.writeFileSync(path.join(iconDir, 'icon.ico'), await encodeIco(icon, sharp));

	if (process.platform === 'darwin')
	{
		await generateIcns(icon, sharp);
	}
}

async function encodeIco(png, sharp)
{
	const sizes = [16, 32, 48, 256];
	const images = await Promise.all(sizes.map(size => sharp(png).resize(size, size).png().toBuffer()));
	const headerSize = 6 + sizes.length * 16;
	let offset = headerSize;
	const header = Buffer.alloc(headerSize);
	header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
	images.forEach((image, index) =>
	{
		const pos = 6 + index * 16;
		header[pos] = sizes[index] === 256 ? 0 : sizes[index];
		header[pos + 1] = sizes[index] === 256 ? 0 : sizes[index];
		header[pos + 2] = 0; header[pos + 3] = 0; header.writeUInt16LE(1, pos + 4); header.writeUInt16LE(32, pos + 6);
		header.writeUInt32LE(image.length, pos + 8); header.writeUInt32LE(offset, pos + 12); offset += image.length;
	});
	return Buffer.concat([header, ...images]);
}

async function generateIcns(png, sharp)
{
	const tmpDir = path.join(iconDir, 'DrawApp.iconset');
	fs.rmSync(tmpDir, {recursive: true, force: true});
	fs.mkdirSync(tmpDir);
	for (const size of [16, 32, 128, 256, 512])
	{
		await sharp(png).resize(size, size).png().toFile(path.join(tmpDir, `icon_${size}x${size}.png`));
		if (size <= 256) await sharp(png).resize(size * 2, size * 2).png().toFile(path.join(tmpDir, `icon_${size}x${size}@2x.png`));
	}
	const result = spawnSync('iconutil', ['-c', 'icns', tmpDir, '-o', path.join(iconDir, 'icon.icns')], {stdio: 'inherit'});
	fs.rmSync(tmpDir, {recursive: true, force: true});
	if (result.status !== 0) throw new Error('Unable to generate macOS ICNS icon');
}
