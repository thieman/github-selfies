chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.method === 'getKeywords') {
		chrome.storage.sync.get('keywords', function(k) {
			sendResponse(k['keywords']);
		});
	}
});
