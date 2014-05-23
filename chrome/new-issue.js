(function() {

  // have to inject CSS since new-issues and issues conflicts and
  // Chrome doesn't correctly exclude injected CSS using exclude_matches
  // see http://stackoverflow.com/questions/20784654/excluding-domains-from-content-scripts-in-manifest-json-doesnt-work-for-css-fil

  var link = document.createElement('link');
  link.href = chrome.extension.getURL('new-issue.css');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  document.documentElement.insertBefore(link);

  var config = {
      insertBefore : ['button:contains(Submit new issue)'],
      bodySelector : '[id^=issue_body]',
      buttonHTML   : (
        '<button id="totallyAwesomeSelfieButton" type="button" class="button">' +
          '<span id="totallyAwesomeSelfieIcon" class="octicon octicon-device-camera"></span>' +
          'Selfie!' +
        '</button>'
      ),
      placeVideo    : function (video, canvas) { $('.form-actions').prepend(video); }
    }
    , client = new GitHubSelfies(config);
  client.setupSelfieStream();
})();
