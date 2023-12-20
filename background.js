chrome.runtime.onConnect.addListener(function (port) {
	if (port.name === 'getCookies') {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			const currentTab = tabs[0];
			if (currentTab) {
				if (currentTab.url.startsWith('https://cuutruyen.net')) {
					chrome.cookies.get(
						{ url: 'https://cuutruyen.net/*', name: 'cuutruyenExtension' },
						function (cookies) {
							port.postMessage({ message: 'sendCookies', cookies: cookies.value });
						}
					);
				}
			}
		});
	}
});
