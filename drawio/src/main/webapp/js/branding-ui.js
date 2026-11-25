// Apply Electron branding to the startup shell. The main process supplies
// decoded values through bootstrap.js before this file is loaded.
(function()
{
	var branding = window.appBranding || {};

	if (!branding.appName && !branding.description && !branding.logoUrl)
	{
		return;
	}

	if (branding.appName)
	{
		document.title = branding.appName;
		var nameMeta = document.querySelector('meta[itemprop="name"]');
		var descriptionMeta = document.querySelector('meta[name="Description"]');
		var itemDescriptionMeta = document.querySelector('meta[itemprop="description"]');
		var splashFallback = document.getElementById('geSplashFallback');
		var splashParagraph = document.querySelector('#geInfo noscript p');
		if (nameMeta) nameMeta.content = branding.appName + ' diagram editor';
		if (descriptionMeta) descriptionMeta.content = branding.description || branding.appName + ' diagram editor';
		if (itemDescriptionMeta) itemDescriptionMeta.content = branding.description || branding.appName + ' diagram editor';
		if (splashFallback) splashFallback.setAttribute('aria-label', branding.appName);
		if (splashParagraph) splashParagraph.textContent = branding.description || branding.appName + ' diagram editor';
	}

	if (branding.logoUrl)
	{
		document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]').forEach(function(link)
		{
			link.href = branding.logoUrl;
		});
	}

	if (branding.logoUrl)
	{
		var splashLogo = document.getElementById('geSplashLogoImage');
		var fallback = document.getElementById('geSplashFallback');

		if (splashLogo && fallback)
		{
			var splashScale = branding.logoScale && branding.logoScale.splash || 1;
			[splashLogo, fallback].forEach(function(image)
			{
				image.style.width = (72 * splashScale) + 'px';
				image.style.height = (72 * splashScale) + 'px';
			});
			splashLogo.onload = function()
			{
				splashLogo.hidden = false;
				fallback.hidden = true;
			};
			splashLogo.onerror = function()
			{
				splashLogo.onerror = null;
				splashLogo.hidden = true;
				fallback.hidden = false;
			};
			splashLogo.src = branding.logoUrl;
		}
	}
})();
