(function() {

  var IMGUR_CLIENT_ID = "cc9df57988494ca";
  var BUTTON_INSERT_BEFORE_SELECTOR = ".composer-submit";
  var SELFIE_BUTTON_SELECTOR = "#totallyAwesomeSelfieButton";
  var VIDEO_SELECTOR = "#selfieVideo";
  var CANVAS_SELECTOR = "#selfieCanvas";
  var BODY_SELECTOR = "#pull_request_body";

  var userMediaConstraints = {video: true};

  var selfieButton = '<button id="totallyAwesomeSelfieButton" type="button" class="button" onclick="return false;" style="position: absolute; right: 10px; bottom: 55px; width: 158px; left: 10px;"><span class="octicon octicon-device-camera" style="font-size: 20px; margin-right: 5px;"></span>Add a Selfie</button>';
  var videoContainer = '<video autoplay id="selfieVideo" style="width: 125px; height: 125px; padding-bottom: 35px;"></video>';
  var canvasContainer = '<canvas id="selfieCanvas" width="400" height="400" style="display: none;"></canvas>';

  var setupSelfieStream = function() {

    if ($(BUTTON_INSERT_BEFORE_SELECTOR).length === 0) {
      setTimeout(setupSelfieStream, 250);
      return;
    }

    $(selfieButton).insertBefore(BUTTON_INSERT_BEFORE_SELECTOR);
    $(canvasContainer).insertBefore(SELFIE_BUTTON_SELECTOR);
    $(videoContainer).insertBefore(SELFIE_BUTTON_SELECTOR);
    $(SELFIE_BUTTON_SELECTOR).on('click', addSelfie);

    navigator.webkitGetUserMedia(userMediaConstraints, function(stream) {
      selfieStream = stream;
      $(VIDEO_SELECTOR).attr('src', window.URL.createObjectURL(selfieStream));
    });
  };

  var snapSelfie = function() {
    var video = document.querySelector(VIDEO_SELECTOR);
    var canvas = document.querySelector(CANVAS_SELECTOR);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('/image/jpeg', 0.9).split(',')[1];
  };

  var addSelfie = function() {
    var imageData = snapSelfie();
    var success = function(data) { addToBody(data['data']['link']); };
    uploadSelfie(imageData, success, notifyFail);
  };

  var uploadSelfie = function(imageData, successCb, errorCb) {
    $.ajax({
      url: 'https://api.imgur.com/3/upload',
      type: 'POST',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Client-ID ' + IMGUR_CLIENT_ID);
      },
      data: {
        type: 'base64',
        image: imageData
      },
      dataType: 'json',
      success: successCb,
      error: errorCb
    });
  };

  var addToBody = function(link) {
    $(BODY_SELECTOR).val($(BODY_SELECTOR).val() + "![selfie](" + link + ")\n");
  };

  var notifyFail = function() {
  };

  setTimeout(setupSelfieStream, 250);

})();
