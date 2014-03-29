(function() {

  var config = {
      insertBefore   : [".composer-submit"],
      bodySelector   : "#pull_request_body",
      buttonHTML     : '<button id="totallyAwesomeSelfieButton" type="button" class="button" onclick="return false;" style="position: absolute; right: 10px; bottom: 55px; width: 158px; left: 10px;"><span class="octicon octicon-device-camera" style="font-size: 20px; margin-right: 5px; line-height: 0px;"></span>Add a Selfie!</button>',
      x              : 300,
      y              : 200,
      postVideoStart : _postVideoStart
    }
    , client = new GitHubSelfies(config);

  function _postVideoStart () {
    $('#selfieVideo').css('display', 'inline-block');
  }
  client.setupSelfieStream();
})();
