(function() {
  var config = {
      insertBefore   : ["button:contains(Submit new issue)"],
      bodySelector   : "#issue_body",
      buttonHTML     : '<button id="totallyAwesomeSelfieButton" type="button" class="button" onclick="return false;" style="margin-right: 5px;"><span class="octicon octicon-device-camera" style="font-size: 22px; margin-right: 5px; line-height: 0px;"></span>Selfie!</button>',
      x              : 300,
      y              : 200,
      placeVideo   : function (video, canvas) {
        console.log('placing video!!!')
        $('.form-actions').append(video);
      },
      placeCheckBox : function (checkbox, button) {
        $(checkbox).insertBefore(button);
        $('.selfieCheckBoxContainer').addClass('newIssueSelfieCheckBoxContainer');
        $('.selfieProgress').addClass('newIssueSelfieProgress');
      }
    }
    , client = new GitHubSelfies(config);
  client.setupSelfieStream();
})();
