(function() {
  var config = {
      insertBefore : ['.composer-submit'],
      bodySelector : '#pull_request_body',
      buttonHTML   : (
        '<div class="selfieButtonContainer">' +
          '<button id="totallyAwesomeSelfieButton" type="button" class="button">' +
            '<span class="octicon octicon-device-camera"></span>' +
            'Add a Selfie!' +
          '</button>' +
        '</div>'
      ),
      placeCheckBox : function _postVideoStart (checkbox) {
        $('.selfieButtonContainer').append(checkbox);
      }
    }
    , client = new GitHubSelfies(config);
  client.setupSelfieStream();
})();
