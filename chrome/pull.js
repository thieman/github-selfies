(function() {

  var config = {
      insertBefore : [
        '[name="comment_and_open"][type="submit"]',
        '[name="comment_and_close"][type="submit"]',
        'button:contains(Comment)'
      ],
      bodySelector : '[name="comment[body]"]',
      buttonHTML   : (
        '<button id="totallyAwesomeSelfieButton" type="button" class="button">' +
          '<span id="totallyAwesomeSelfieIcon" class="octicon octicon-device-camera"></span>' +
          'Selfie!' +
        '</button>'
      ),
      placeVideo     : function (video) { $('#js-new-comment-form-actions').append(video); },
      preVideoStart  : function () { $('#js-new-comment-form-actions').addClass('expandSome'); },
      postVideoStart : function () {
        $('#js-new-comment-form-actions')
          .removeClass('expandSome')
          .addClass('expand');
      },
      postVideoStop : function () { $('#js-new-comment-form-actions').removeClass('expand'); }

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
})();
