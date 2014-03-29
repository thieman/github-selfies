(function() {

  var config = {
      insertBefore : [
        '[name="comment_and_open"][type="submit"]',
        '[name="comment_and_close"][type="submit"]',
        'button:contains(Comment)'
      ],
      bodySelector   : "[name='comment[body]']",
      buttonHTML     : '<button id="totallyAwesomeSelfieButton" type="button" class="button" onclick="return false;" style="margin-right: 5px;"><span class="octicon octicon-device-camera" style="font-size: 22px; margin-right: 5px; line-height: 0px;"></span>Selfie!</button>',
      x              : 300,
      y              : 200
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

  return client;

})();
