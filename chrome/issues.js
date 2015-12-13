$(document).on('ready', function() {

  // have to inject CSS since new-issues and issues conflicts and
  // Chrome doesn't correctly exclude injected CSS using exclude_matches
  // see http://stackoverflow.com/questions/20784654/excluding-domains-from-content-scripts-in-manifest-json-doesnt-work-for-css-fil

  var link = document.createElement('link');
  link.href = chrome.extension.getURL('issues.css');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  document.getElementsByTagName("head")[0].appendChild(link);

  var config = {
      insertBefore : [
        '[name="comment_and_open"][type="submit"]',
        '[name="comment_and_close"][type="submit"]',
        'button:contains(Comment)'
      ],
      bodySelector : "[name='comment[body]']",
      buttonHTML   : (
        '<button id="totallyAwesomeSelfieButton" type="button" class="button">' +
          '<span id="totallyAwesomeSelfieIcon" class="octicon octicon-device-camera"></span>' +
          'Selfie!' +
        '</button>'
      ),
      placeVideo     : function (video) { $('#partial-new-comment-form-actions').prepend(video); },
      preVideoStart  : function () { $('#partial-new-comment-form-actions').addClass('expandSome'); },
      postVideoStart : function () {
        $('#partial-new-comment-form-actions')
          .removeClass('expandSome')
          .addClass('expand');
      },
      postVideoStop : function () { $('#partial-new-comment-form-actions').removeClass('expand'); }
    }
    , client = new GitHubSelfies(config);

  client.setupSelfieStream();

  // if the user submits a comment, we need to add everything to the next one
  var trySetupAgain = function() {
    if (client.setupComplete && $('#totallyAwesomeSelfieButton').length === 0) {
      client.setupSelfieStream();
    }
  };
  setInterval(trySetupAgain, 500);

  // github hides instead of deleting dom elements when you submit
  var cleanup = function() {
    $('#totallyAwesomeSelfieButton').remove();
    $('#selfieVideo').remove();
    $('#selfieCanvas').remove();
  };

  $('[name="comment_and_open"]').on('click', cleanup);
  $('[name="comment_and_close"]').on('click', cleanup);
});
