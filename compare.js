(function() {

  var client = new GitHubSelfies(
    ".composer-submit",
    "#pull_request_body",
    "#totallyAwesomeSelfieButton",
    "#selfieVideo",
    "#selfieCanvas");

  client.buttonHTML = '<button id="totallyAwesomeSelfieButton" type="button" class="button" onclick="return false;" style="position: absolute; right: 10px; bottom: 55px; width: 158px; left: 10px;"><span class="octicon octicon-device-camera" style="font-size: 20px; margin-right: 5px; line-height: 0px;"></span>Add a Selfie!</button>';
  client.videoHTML = '<video autoplay id="selfieVideo" style="width: 125px; height: 125px; padding-bottom: 35px;"></video>';
  client.canvasHTML = '<canvas id="selfieCanvas" style="display: none;"></canvas>';

  client.setupSelfieStream();

})();
