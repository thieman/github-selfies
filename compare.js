(function() {

  var IMGUR_CLIENT_ID = "cc9df57988494ca";
  var BUTTON_INSERT_BEFORE_SELECTOR = ".composer-submit";
  var SELFIE_BUTTON_SELECTOR = "#totallyAwesomeSelfieButton";
  var VIDEO_SELECTOR = "#selfieVideo";
  var CANVAS_SELECTOR = "#selfieCanvas";
  var BODY_SELECTOR = "#pull_request_body";

  var selfieButton = '<button id="totallyAwesomeSelfieButton" type="button" class="button" onclick="return false;" style="position: absolute; right: 10px; bottom: 55px; width: 158px; left: 10px;"><span class="octicon octicon-device-camera" style="font-size: 20px; margin-right: 5px; line-height: 0px;"></span>Add a Selfie</button>';
  var videoContainer = '<video autoplay id="selfieVideo" style="width: 125px; height: 125px; padding-bottom: 35px;"></video>';
  var canvasContainer = '<canvas id="selfieCanvas" style="display: none;"></canvas>';

  var selfiesTaken = 0;

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
      $('.write-tab').on('click', showElements);
      $('.preview-tab').on('click', hideElements);
      $(VIDEO_SELECTOR).attr('src', window.URL.createObjectURL(stream));
    });
  };

  var resizeCanvasElement = function() {
    var video = document.querySelector(VIDEO_SELECTOR);
    $(CANVAS_SELECTOR).attr('height', video.videoHeight);
    $(CANVAS_SELECTOR).attr('width', video.videoWidth);
  };

  var addSelfie = function() {
    var thisSelfieNumber = selfiesTaken + 1;
    selfiesTaken++;
    addSelfiePlaceholder(thisSelfieNumber);
    var imageData = snapSelfie();
    var success = function(data) { replacePlaceholderInBody(thisSelfieNumber, data['data']['link']); };
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

  var addSelfiePlaceholder = function(number) {
    if ($(BODY_SELECTOR).val() !== "") {
      $(BODY_SELECTOR).val($(BODY_SELECTOR).val() + "\n");
    }
    $(BODY_SELECTOR).val($(BODY_SELECTOR).val() + "[[selfie-placeholder-" + number + "]]\n");
  };

  var replacePlaceholderInBody = function(number, link) {
    var textarea = document.querySelector(BODY_SELECTOR);
    var toReplace = "[[selfie-placeholder-" + number + "]]";
    $(BODY_SELECTOR).val($(BODY_SELECTOR).val().replace(toReplace, "![selfie-" + number + "](" + link + ")"));
    textarea.focus();
    textarea.setSelectionRange(textarea.textLength, textarea.textLength);
  }

  var notifyFail = function() {
    $(VIDEO_SELECTOR).remove();
    $(CANVAS_SELECTOR).remove();
    $(SELFIE_BUTTON_SELECTOR).prop('disabled', true);
    $(SELFIE_BUTTON_SELECTOR).children('span').remove();
    $(SELFIE_BUTTON_SELECTOR).text('Something broke :(');
    $(SELFIE_BUTTON_SELECTOR).addClass('danger');
  };

  var hideElements = function() {
    $(VIDEO_SELECTOR).css('display', 'none');
    $(SELFIE_BUTTON_SELECTOR).css('display', 'none');
  };

  var showElements = function() {
    $(VIDEO_SELECTOR).css('display', 'inline-block');
    $(SELFIE_BUTTON_SELECTOR).css('display', 'inline-block');
  };

  setTimeout(setupSelfieStream, 250);

})();
