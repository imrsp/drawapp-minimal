import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {loadBranding} from '../src/main/branding.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targets = {
	mac: ['--config', 'electron-builder-linux-mac.json', '--mac', 'dir', '--publish', 'never'],
	win: ['--config', 'electron-builder-win.json', '--publish', 'never'],
	winArm64: ['--config', 'electron-builder-win-arm64.json', '--publish', 'never'],
	appx: ['--config', 'electron-builder-appx.json', '--publish', 'never'],
	linux: ['--config', 'electron-builder-linux-mac.json', '--linux', '--publish', 'never'],
	snap: ['--config', 'electron-builder-snap.json', '--publish', 'never']
};

const targetName = process.argv[2];
const args = targets[targetName];

if (args == null)
{
	console.error(`Unknown build target "${targetName || ''}". Choose one of: ${Object.keys(targets).join(', ')}`);
	process.exit(2);
}

const branding = loadBranding(path.join(rootDir, 'config'));
const productName = branding.appName.replace(/[\\/:*?"<>|]/g, '-').trim() || 'drawapp-minimal';
const executable = process.platform === 'win32' ?
	path.join(rootDir, 'node_modules', '.bin', 'electron-builder.cmd') :
	path.join(rootDir, 'node_modules', '.bin', 'electron-builder');

const result = spawnSync(executable, [...args, ...process.argv.slice(3)], {
	cwd: rootDir,
	env: {...process.env, DRAWAPP_PRODUCT_NAME: productName},
	stdio: 'inherit',
	shell: process.platform === 'win32'
});

if (result.error)
{
	console.error(result.error.message);
	process.exit(1);
}

process.exit(result.status ?? 1);
