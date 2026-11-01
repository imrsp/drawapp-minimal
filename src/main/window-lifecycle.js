/**
 * app.quit() can be interrupted when the close handler asks the renderer
 * whether the current document has unsaved changes. Resume that quit only
 * after the user explicitly asked to quit and every window has closed.
 */
export function shouldResumeQuitAfterWindowClosed(quitRequested, windows)
{
	return quitRequested && windows.every(win => win.isDestroyed());
}
