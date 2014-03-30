function GitHubSelfies(insertBefore, bodySelector, buttonSelector, videoSelector, canvasSelector, buttonHTML, videoHTML, canvasHTML) {

  this.clientId = "cc9df57988494ca";
  this.insertBefore = insertBefore;
  this.bodySelector = bodySelector;
  this.buttonSelector = buttonSelector;
  this.videoSelector = videoSelector;
  this.canvasSelector = canvasSelector;
  this.buttonHTML = buttonHTML;
  this.videoHTML = videoHTML;
  this.canvasHTML = canvasHTML;

  this.selfiesTaken = 0;
  this.stream = null;
  this.setupComplete = false;

  this.setupSelfieStream = function() {

    var that = this;
    for (var i = 0; i < this.insertBefore.length; i++) {
      var candidate = this.insertBefore[i] + ':visible';
      if ($(candidate).length !== 0) {
        break;
      }
      candidate = null;
    };

    if (candidate === null) {
      setTimeout(function() { that.setupSelfieStream(); }, 250);
      return;
    };

    $(that.buttonHTML).insertBefore(candidate);
    $(that.canvasHTML).insertBefore(that.buttonSelector);
    $(that.videoHTML).insertBefore(that.buttonSelector);

    $(that.buttonSelector).on('click', $.proxy(that.addSelfie, that));
    $(that.buttonSelector).hover($.proxy(that.startVideo, that),
                                 $.proxy(that.stopVideo, that));
    $('.write-tab').on('click', $.proxy(that.showElements, that));
    $('.preview-tab').on('click', $.proxy(that.hideElements, that));

    that.setupComplete = true;

  }

  this.resizeCanvasElement = function() {
    var video = document.querySelector(this.videoSelector);
    $(this.canvasSelector).attr('height', video.videoHeight);
    $(this.canvasSelector).attr('width', video.videoWidth);
  };

  this.addSelfie = function(client) {
    var that = this;
    var thisSelfieNumber = this.selfiesTaken + 1;
    this.selfiesTaken++;
    this.addSelfiePlaceholder(thisSelfieNumber);
    var imageData = this.snapSelfie();
    var success = function(data) { that.replacePlaceholderInBody(thisSelfieNumber, data['data']['link']); };
    this.uploadSelfie(imageData, success, this.notifyFail);
  };

  this.snapSelfie = function() {
    this.resizeCanvasElement();
    var video = document.querySelector(this.videoSelector);
    var canvas = document.querySelector(this.canvasSelector);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('/image/jpeg', 1).split(',')[1];
  };

  this.uploadSelfie = function(imageData, successCb, errorCb) {
    var that = this;
    $.ajax({
      url: 'https://api.imgur.com/3/upload',
      type: 'POST',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Client-ID ' + that.clientId);
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

  this.addSelfiePlaceholder = function(number) {
    if ($(this.bodySelector).val() !== "") {
      $(this.bodySelector).val($(this.bodySelector).val() + "\n");
    }
    $(this.bodySelector).val($(this.bodySelector).val() + "[[selfie-placeholder-" + number + "]]\n");
  };

  this.replacePlaceholderInBody = function(number, link) {
    var textarea = document.querySelector(this.bodySelector);
    var toReplace = "[[selfie-placeholder-" + number + "]]";
    $(this.bodySelector).val($(this.bodySelector).val().replace(toReplace, "![selfie-" + number + "](" + link + ")"));
    textarea.focus();
    textarea.setSelectionRange(textarea.textLength, textarea.textLength);
  }

  this.notifyFail = function() {
    $(this.videoSelector).remove();
    $(this.canvasSelector).remove();
    $(this.buttonSelector).prop('disabled', true);
    $(this.buttonSelector).children('span').remove();
    $(this.buttonSelector).text('Something broke :(');
    $(this.buttonSelector).addClass('danger');
  };

  this.startVideo = function() {
    var that = this;
    navigator.webkitGetUserMedia({video: true}, function(stream) {
      that.stream = stream;
      var video = document.querySelector(that.videoSelector);
      $(that.videoSelector).attr('src', window.URL.createObjectURL(stream));
    }, this.notifyFail);
  };

  this.stopVideo = function() {
    var video = document.querySelector(this.videoSelector);
    this.stream.stop();
    this.stream = null;
  };

  this.hideElements = function() {
    $(this.buttonSelector).css('display', 'none');
  };

  this.showElements = function() {
    $(this.buttonSelector).css('display', 'inline-block');
  };

};
