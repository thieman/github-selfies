(function() {
  var config = {
      insertBefore : ['button:contains(Submit new issue)'],
      bodySelector : '#issue_body',
      buttonHTML   : (
        '<button id="totallyAwesomeSelfieButton" type="button" class="button">' +
          '<span id="totallyAwesomeSelfieIcon" class="octicon octicon-device-camera"></span>' +
          'Selfie!' +
        '</button>'
      ),
      placeVideo    : function (video, canvas) { $('.form-actions').append(video); },
      placeCheckBox : function (checkbox, button) {
        $(checkbox).insertBefore(button);
        $('.selfieCheckBoxContainer').addClass('newIssueSelfieCheckBoxContainer');
        $('.selfieProgress').addClass('newIssueSelfieProgress');
      }
    }
    , client = new GitHubSelfies(config);
  client.setupSelfieStream();
})();
