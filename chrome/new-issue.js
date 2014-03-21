(function() {

  var client = new GitHubSelfies(
    ["button:contains(Submit new issue)"],
    "#issue_body",
    "#totallyAwesomeSelfieButton",
    "#selfieVideo",
    "#selfieCanvas");

  client.buttonHTML = '<button id="totallyAwesomeSelfieButton" type="button" class="button" onclick="return false;" style="margin-right: 5px;"><span class="octicon octicon-device-camera" style="font-size: 22px; margin-right: 5px; line-height: 0px;"></span>Selfie!</button>';
  client.videoHTML = '<video autoplay id="selfieVideo" style="display: none;"></video>';
  client.canvasHTML = '<canvas id="selfieCanvas" style="display: none;"></canvas>';

  client.setupSelfieStream();

})();
