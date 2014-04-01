(function() {
  var config = {
      insertBefore   : ['.composer-submit'],
      bodySelector   : '#pull_request_body',
      buttonHTML     : (
        '<div class="selfieButtonContainer">' +
          '<button id="totallyAwesomeSelfieButton" type="button" class="button" onclick="return false;">' +
          '<span class="octicon octicon-device-camera"></span>' +
          'Add a Selfie!' +
        '</button></div>'),
      x              : 300,
      y              : 200,
      placeCheckBox  : function _postVideoStart (checkbox) {
        $('.selfieButtonContainer').append(checkbox);
      }
    }
    , client = new GitHubSelfies(config);
  client.setupSelfieStream();
})();
