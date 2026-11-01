import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {shouldResumeQuitAfterWindowClosed} from '../main/window-lifecycle.js';

describe('shouldResumeQuitAfterWindowClosed', () =>
{
	test('does not quit when the last window was closed with the macOS close button', () =>
	{
		assert.equal(shouldResumeQuitAfterWindowClosed(false, []), false);
	});

	test('resumes an explicit quit after the final window is destroyed', () =>
	{
		assert.equal(shouldResumeQuitAfterWindowClosed(true, []), true);
	});

	test('waits for other windows to close before resuming quit', () =>
	{
		const windows = [{isDestroyed: () => true}, {isDestroyed: () => false}];
		assert.equal(shouldResumeQuitAfterWindowClosed(true, windows), false);
	});
});
