// Create a selfie button in the given form.
function GitHubSelfieButtons() {
  this.elem = $(
    '<div class="github-selfies github-selfies--selfieControls">' +
    '<button type="button" class="selfieToggle btn btn-default">Video instead</button>' +
    '<button type="button" class="totallyAwesomeSelfieButton btn btn-default">' +
    '<span class="octicon octicon-device-camera"></span>' +
    ' Selfie!' +
    '</button>' +
    '</div>');

  this.selfieButton = this.elem.find('.totallyAwesomeSelfieButton');
  this.selfieToggle = this.elem.find('.selfieToggle');
  this.videoPreview = null;
  this.dynamic = false; // dynamic == video
  this.onselfie = function (isDynamic, video, canvas, ctx, callback) {
  };

  this.selfieButton
    .on('click', function() {
      if (this.videoPreview === null) {
        this.showVideoPreview();
        this.disableButton();
        this.videoPreview.startPreview(this);
      } else {
        // TODO: change label?
        this.onselfie(this.dynamic);
      }
    }.bind(this));
  this.selfieToggle.on('click', this.toggleSelfieType);
}

GitHubSelfieButtons.prototype.insertBefore = function(element) {
  // Be careful not to insert more than once!
  this.elem.eq(0).insertBefore(element);
  return this;
};

GitHubSelfieButtons.prototype.hide = function() {
  this.elem.addClass('github-selfies--hidden');
  return this;
};
GitHubSelfieButtons.prototype.show = function() {
  this.elem.removeClass('github-selfies--hidden');
  return this;
};

GitHubSelfieButtons.prototype.destroy = function() {
  this.elem.remove();
  this.selfieButton = null;
  this.selfieToggle = null;
};

GitHubSelfieButtons.prototype.showVideoPreview = function() {
  if (this.videoPreview === null) {
    // Insert the preview before the buttons
    this.videoPreview = new GitHubSelfieVideoPreview();
    this.videoPreview.insertBefore(this.elem);
  }
  this.videoPreview.show();
  return this;
};
GitHubSelfieButtons.prototype.disableButton = function() {
  this.selfieButton.prop('disabled', true);
  return this;
};
GitHubSelfieButtons.prototype.enableButton = function() {
  this.selfieButton.prop('disabled', false);
  return this;
};

GitHubSelfieButtons.prototype.hideVideoPreview = function() {
  if (this.videoPreview !== null) {
    this.videoPreview.hide();
    // TODO: destroy??
  }
  return this;
};

GitHubSelfieButtons.prototype.toggleSelfieType = function() {
  this.selfieToggle.text(this.dynamic ? 'Photo instead' : 'Video instead');
  this.selfieButton.toggleClass('octicon-device-camera octicon-device-camera-video');
  this.selfieToggle.toggleClass('selected dark-grey');
  this.dynamic = !this.dynamic;
};


function GitHubSelfieVideoPreview() {
  this.elem = $(
    '<div class="github-selfies github-selfies--selfieVideoContainer github-selfies--hidden">' +
    '<div class="selfieProgressContainer"><div class="selfieProgress"></div></div>' +
    '<div class="selfie-countdown">' +
    '<div class="counter-container"></div>' +
    '<video autoplay id="selfieVideo"></video>' +
    '</div>' +
    '<p class="selfieVideoOverlay"></p>' +
    '<canvas id="selfieCanvas" class="hidden"></canvas>' +
    '</div>'
  );

  this.videoElem = this.elem.find('video').get(0);
  this.canvasElem = this.elem.find('canvas').get(0);
  this.textOverlay = this.elem.find('.selfieVideoOverlay');
  this.counterContainer = this.elem.find('.counter-container');
  this.stream = null;
}

GitHubSelfieVideoPreview.prototype.insertBefore = function(element) {
  // Be careful not to insert more than once!
  this.elem.eq(0).insertBefore(element);
  return this;
};

GitHubSelfieVideoPreview.prototype.resizeCanvas = function(isDynamic) {
  this.canvasElem.setAttribute('height', this.videoElem.videoHeight / (isDynamic ? 3 : 1));
  this.canvasElem.setAttribute('width', this.videoElem.videoWidth /  (isDynamic ? 3 : 1));
  return this;
};

GitHubSelfieVideoPreview.prototype.hide = function() {
  this.elem.addClass('github-selfies--hidden');
  return this;
};
GitHubSelfieVideoPreview.prototype.show = function() {
  this.elem.removeClass('github-selfies--hidden');
  return this;
};

GitHubSelfieVideoPreview.prototype.setMessage = function(message) {
  this.textOverlay.text(message);
  return this;
};

GitHubSelfieVideoPreview.prototype.stopPreview = function() {
  // TODO: destroy??
  this.stream.stop();
  this.stream = null;
};

GitHubSelfieVideoPreview.prototype.destroy = function() {
  this.stopPreview();
  this.elem.remove();
  this.videoElem = null;
  this.canvasElem = null;
  this.textOverlay = null;
  this.counterContainer = null;
};

GitHubSelfieVideoPreview.prototype.startPreview = function(buttons) {
  this.setMessage('Fetching camera stream...');

  // TODO: handle video stream events
  // TODO: gotta clean up previous stuff! close video, etc

  var getUserMedia;
  if (typeof navigator.webkitGetUserMedia === 'function') {
    getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
  } else if (typeof navigator.mozGetUserMedia === 'function') {
    getUserMedia = navigator.mozGetUserMedia.bind(navigator);
  } else {
    getUserMedia = function () { alert("Your browser does not support camera input!"); };
  }

  getUserMedia({video: true}, function(_stream) {
    buttons.enableButton();
    this.setMessage('');
    this.stream = _stream;
    this.videoElem.src = window.URL.createObjectURL(_stream);
    console.log("Video:", this.stream, this.videoElem, this.videoElem.src);

    // this.stream.onended = function(e) { console.info("ended", e); };
    // this.stream.onactive = function(e) { console.info("active", e); };
    // this.stream.oninactive = function(e) { console.info("inactive", e); };
    // TODO stream events
  }.bind(this), function(e) {
    if (e.name === 'DevicesNotFoundError') {
      buttons.enableButton();
      this.setMessage("You don't have a camera available!");
    } else {
      console.error("Couldn't start selfie video", e);
      this.notifyFail();
    }
  }.bind(this));
};

// TODO
  function notifyFail () {
    $(videoSelector).remove();
    $(canvasSelector).remove();
    $(buttonSelector)
      .prop('disabled', true)
      .text('Something broke :(')
      .addClass('btn-danger')
      .children('span').remove();
  }

GitHubSelfieVideoPreview.prototype.snapSelfie = function(dynamic, takeSelfieCallback, fileCallback) {
  this.resizeCanvas(dynamic);
  var ctx = this.canvasElem.getContext('2d');
  this.selfieCountdown(takeSelfieCallback(this.videoElem, this.canvasElem, ctx, fileCallback));
};

// TODO: de-classify this

GitHubSelfieVideoPreview.prototype.showCount = function (count, callback) {
  if (count > 0) {
    this.counterContainer.html('<h3 class="count">' + count + '</h3>');
    setTimeout(function() { this.showCount(count - 1, callback); }.bind(this), 1000);
  } else {
    this.counterContainer.empty();
    callback();
  }
};
GitHubSelfieVideoPreview.prototype.selfieCountdown = function(callback) {
  this.showCount(3, callback);
};



function GitHubSelfies(config) {
  var stream = null;

  var selfiesTaken   = 0;
  var interval       = 100;
  var clientId       = 'cc9df57988494ca';
  var buttons = null;

  // TODO: "close" button
  // TODO: move status overlay

  // TODO: build component object w/ elems for buttons, video

  this.setupSelfieStream = function setupSelfieStream () {
    if (buttons !== null) {
      // TODO: gotta clean up previous stuff! close video, etc
    }

    var candidate;
    for (var i = 0; i < config.insertBefore.length; i++) {
      candidate = $(config.insertBefore[i] + ':visible');
      if (candidate.length !== 0) {
        break;
      }
      candidate = null;
    }
    if (candidate === null) {
      setTimeout(function() { setupSelfieStream(); }, 250);
    } else {
      $('.form-actions-protip').hide();
      buttons = new GitHubSelfieButtons();
      buttons.insertBefore(candidate);
      setupEvents(buttons);
    }
  };

  function hideElements () {
    $('.github-selfies').addClass(hiddenClass);
  }

  function showElements () {
    $('.github-selfies').removeClass(hiddenClass);
  }

  function setupEvents (buttons) {
    buttons.onselfie = addSelfie;
    $('.write-tab').on('click', showElements);
    $('.preview-tab').on('click', hideElements);
  }

  function addSelfie (isDynamic) {
    var thisSelfieNumber = selfiesTaken++;

    addSelfiePlaceholder(thisSelfieNumber);
    buttons.videoPreview.snapSelfie(isDynamic, isDynamic ? dynamicSelfie : staticSelfie, imageSuccess);

    function imageSuccess (_imageData) {
      uploadSelfie(_imageData, success, notifyFail);
    }

    function success (res) {
      replacePlaceholderInBody(thisSelfieNumber, res.data.link);
    }
  }

  function staticSelfie (video, canvas, ctx, callback) {
    return function () {
      var imgBinary;

      ctx.save();
      ctx.translate(video.videoWidth, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, video.videoWidth, video.videoHeight);
      imgBinary = canvas.toDataURL('/image/jpeg', 1).split(',')[1];
      ctx.restore();
      callback(imgBinary);
    };
  }

  function dynamicSelfie (video, canvas, ctx, callback) {
    return function () {
      var encoder = new GIFEncoder();
      var frame   = 0;
      var clock;

      encoder.setRepeat(0);
      encoder.setDelay(interval);
      encoder.start();

      clock = setInterval(function () {
        var videoWidth  = $(video).width();
        var totalFrames = 20;
        var binaryGif;
        var dataUrl;

        if (frame >= totalFrames) {
          encoder.finish();
          binaryGif = encoder.stream().getData();
          dataUrl   = 'data:image/gif;base64,'+ encode64(binaryGif);
          callback(encode64(binaryGif));
          clearInterval(clock);
          $('.selfieProgress').css('width', 0);
        } else {
          ctx.save();
          ctx.translate(video.videoWidth / 3, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, video.videoWidth / 3, video.videoHeight / 3);
          encoder.addFrame(ctx);
          ctx.restore();
          frame++;
          $('.selfieProgress').css('width', (videoWidth / totalFrames) * frame);
        }
      }, interval);
    };
  }

  function uploadSelfie (imageData, successCb, errorCb) {
    $.ajax({
      url  : 'https://api.imgur.com/3/upload',
      type : 'POST',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Client-ID ' + clientId);
      },
      data: {
        type  : 'base64',
        image : imageData
      },
      dataType : 'json',
      success  : successCb,
      error    : errorCb
    });
  }

  function addSelfiePlaceholder (number) {
    // TODO: too fragile!
    var textarea = buttons.elem.parent().parent().prev().find('textarea');
    console.log('textarea', textarea);
    var currentContents = textarea.val();
    if (currentContents !== '') {
      textarea.val(currentContents + '\n');
    }
    textarea.val(currentContents + '[[selfie-placeholder-' + number + ']]\n');
  }

  function replacePlaceholderInBody (number, link) {
    var textarea = buttons.elem.parent().parent().prev().find('textarea');
    console.log('textarea', textarea);
    var toReplace = '[[selfie-placeholder-' + number + ']]';

    textarea.val(
      textarea.val()
        .replace(toReplace, '![selfie-' + number + '](' + link + ')'));
    textarea.focus();
    textarea.setSelectionRange(textarea.textLength, textarea.textLength);
  }
}
