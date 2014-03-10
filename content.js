(function() {

  var IMGUR_CLIENT_ID = "cc9df57988494ca";
  var BUTTON_INSERT_BEFORE_SELECTOR = ".composer-submit";
  var SELFIE_BUTTON_SELECTOR = "#totallyAwesomeSelfieButton";
  var VIDEO_SELECTOR = "#selfieVideo";
  var CANVAS_SELECTOR = "#selfieCanvas";
  var BODY_SELECTOR = "#pull_request_body";

  var selfieButton = '<button id="totallyAwesomeSelfieButton" type="button" class="button" onclick="return false;" style="position: absolute; right: 10px; bottom: 55px; width: 158px; left: 10px;"><span class="octicon octicon-device-camera" style="font-size: 20px; margin-right: 5px;"></span>Add a Selfie</button>';
  var videoContainer = '<video autoplay id="selfieVideo" style="width: 125px; height: 125px; padding-bottom: 35px;"></video>';
  var canvasContainer = '<canvas id="selfieCanvas" style="display: none;"></canvas>';

  var setupSelfieStream = function() {

    if ($(BUTTON_INSERT_BEFORE_SELECTOR).length === 0) {
      setTimeout(setupSelfieStream, 250);
      return;
    }

    navigator.webkitGetUserMedia({video: true}, function(stream) {
      $(selfieButton).insertBefore(BUTTON_INSERT_BEFORE_SELECTOR);
      $(canvasContainer).insertBefore(SELFIE_BUTTON_SELECTOR);
      $(videoContainer).insertBefore(SELFIE_BUTTON_SELECTOR);
      $(SELFIE_BUTTON_SELECTOR).on('click', addSelfie);
      $(VIDEO_SELECTOR).attr('src', window.URL.createObjectURL(stream));
    });
  };

  var resizeCanvasElement = function() {
    var video = document.querySelector(VIDEO_SELECTOR);
    $(CANVAS_SELECTOR).attr('height', video.videoHeight);
    $(CANVAS_SELECTOR).attr('width', video.videoWidth);
  };

  var addSelfie = function() {
    var imageData = snapSelfie();
    var success = function(data) { addToBody(data['data']['link']); };
    uploadSelfie(imageData, success, notifyFail);
  };

  var snapSelfie = function() {
    resizeCanvasElement();
    var video = document.querySelector(VIDEO_SELECTOR);
    var canvas = document.querySelector(CANVAS_SELECTOR);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('/image/jpeg', 1).split(',')[1];
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
    if ($(BODY_SELECTOR).val() !== "") {
      $(BODY_SELECTOR).val($(BODY_SELECTOR).val() + "\n");
    }
    $(BODY_SELECTOR).val($(BODY_SELECTOR).val() + "![selfie](" + link + ")\n");
  }

  var notifyFail = function() {
  };

  var hideOrShowElements = function() {
    if ($('.write-tab.selected').length > 0 ) {
      $(VIDEO_SELECTOR).css('display', 'inline-block');
      $(SELFIE_BUTTON_SELECTOR).css('display', 'inline-block');
    } else if ($('.preview-tab.selected').length > 0) {
      $(VIDEO_SELECTOR).css('display', 'none');
      $(SELFIE_BUTTON_SELECTOR).css('display', 'none');
    }
  };

  setTimeout(setupSelfieStream, 250);
  setInterval(hideOrShowElements, 100);

})();
