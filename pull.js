(function() {

  var IMGUR_CLIENT_ID = "cc9df57988494ca";
  var BUTTON_INSERT_BEFORE_SELECTOR = "[name='comment_and_close']";
  var SELFIE_BUTTON_SELECTOR = "#totallyAwesomeSelfieButton";
  var VIDEO_SELECTOR = "#selfieVideo";
  var CANVAS_SELECTOR = "#selfieCanvas";
  var BODY_SELECTOR = "[name='comment[body]']";

  var selfieButton = '<button id="totallyAwesomeSelfieButton" type="button" class="button" onclick="return false;" style="margin-right: 5px;"><span class="octicon octicon-device-camera" style="font-size: 22px; margin-right: 5px; line-height: 0px;"></span>Selfie!</button>';
  var videoContainer = '<video autoplay id="selfieVideo" style="display: none;"></video>';
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
    $(SELFIE_BUTTON_SELECTOR).css('display', 'none');
  };

  var showElements = function() {
    $(SELFIE_BUTTON_SELECTOR).css('display', 'inline-block');
  };

  setTimeout(setupSelfieStream, 250);

})();
