// A selfie toggle button that can be attached to the document.
function GitHubSelfieButtons() {
  this.elem = $(
    '<div class="github-selfies" id="selfieControls">' +
    '<button type="button" class="totallyAwesomeSelfieButton btn btn-default">' +
    '<span class="octicon octicon-device-camera"></span>' +
    ' Selfie!' +
    '</button>' +
    '</div>');

  this.selfieButton = this.elem.find('.totallyAwesomeSelfieButton');
  this.videoPreview = null;

  // TODO: This passthrough sucks
  this.onselfie = function(isDynamic, video, canvas, ctx, callback) {};

  this.selfieButton
    .on('click', () => {
      if (this.videoPreview === null) {
        this.selfieButton.addClass('selected');
        this.showVideoPreview();
        this.videoPreview.startPreview();
      } else {
        this.videoPreview.destroy();
        this.videoPreview = null;
        this.selfieButton.removeClass('selected');
      }
    });
}

GitHubSelfieButtons.prototype = {
  insert: function(element) {
    // Be careful not to insert more than one!
    this.elem.eq(0).appendTo(element);
  },

  destroy: function() {
    this.elem.remove();
    this.selfieButton = null;
    if (this.videoPreview !== null) {
      this.videoPreview.destroy();
    }
    this.videoPreview = null;
    this.onselfie = null;
  },

  showVideoPreview: function() {
    if (this.videoPreview === null) {
      // Insert the preview before the buttons
      this.videoPreview = new GitHubSelfieVideoPreview();
      this.videoPreview.onselfie = this.onselfie;
      this.videoPreview.insert(this.elem);
    }
  },

  disableButton: function() {
    this.selfieButton.prop('disabled', true);
  },

  enableButton: function() {
    this.selfieButton.prop('disabled', false);
  }
};

// A selfie video preview and buttons that can be attached to the document.
function GitHubSelfieVideoPreview() {
  this.elem = $(
    '<div class="github-selfies selfieVideoContainer">' +
    '<div class="selfieProgressContainer"><div class="selfieProgress"></div></div>' +
    '<div class="selfie-countdown">' +
    '<div class="counter-container"></div>' +
    '<video autoplay id="selfieVideo"></video>' +
    '</div>' +
    '<p class="selfieVideoOverlay"></p>' +
    '<canvas id="selfieCanvas" class="hidden"></canvas>' +
    '<div class="btn-group">' +
    '<button type="button" class="selfiePhotoButton btn btn-sm selected">' +
    '<span class="octicon octicon-device-camera"></span>' +
    ' Photo' +
    '</button>' +
    '<button type="button" class="selfieVideoButton btn btn-sm">' +
    '<span class="octicon octicon-device-camera-video"></span>' +
    ' Video' +
    '</button>' +
    '</div>' +
    '<select class="selfieDuration">' +
    '<option>1</option>' +
    '<option>2</option>' +
    '<option>3</option>' +
    '<option>4</option>' +
    '</select>' +
    '<button type="button" class="selfieTakeButton btn btn-primary btn-sm">' +
    ' Take a selfie!' +
    '</button>' +
    '</div>'
  );

  this.onselfie = function(isDynamic, video, canvas, ctx, callback) {};

  this.videoElem = this.elem.find('video').get(0);
  this.canvasElem = this.elem.find('canvas').get(0);
  this.textOverlay = this.elem.find('.selfieVideoOverlay');
  this.counterContainer = this.elem.find('.counter-container');
  this.photoButton = this.elem.find('.selfiePhotoButton');
  this.photoButton
    .on('click', this.setSelfieType.bind(this));
  this.videoButton = this.elem.find('.selfieVideoButton');
  this.videoButton
    .on('click', this.setSelfieType.bind(this));
  this.takeButton = this.elem.find('.selfieTakeButton');
  this.takeButton
    .on('click', () => this.onselfie(this.dynamic));
  this.progress = this.elem.find('.selfieProgress');
  this.stream = null;
  this.dynamic = false; // dynamic == video
  this.videoDuration = 2; // seconds
  this.loadPreferences();

  this.durationSelector = this.elem.find('.selfieDuration');
  this.durationSelector.val(this.videoDuration);
  this.durationSelector.on('change', () => {
    this.setVideoDuration(this.durationSelector.val());
    this.savePreferences();
  });

  if (this.dynamic) {
    this.videoButton.addClass('selected');
    this.photoButton.removeClass('selected');
  }

  // Turn off the preview when the page is not visible to save battery
  // and reduce the creepy feeling when your camera light is on because of
  // a page you forgot about.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'visible') {
      if (this.stream === null) {
        this.startPreview();
      }
    } else {
      this.stopPreview();
    }
  }, false);
}

GitHubSelfieVideoPreview.prototype = {
  insert: function(element) {
    // Be careful not to insert more than one!
    this.elem.eq(0).insertAfter(element);
  },

  // Video (dynamic) needs to be resized smaller for preformnce
  resizeCanvas: function(isDynamic) {
    var scalefactor = 1 / (isDynamic ? 2 : 1);
    if (isDynamic) {
      // Video is always 320x240
      this.canvasElem.setAttribute('width', 320);
      this.canvasElem.setAttribute('height', 240);
    } else {
      this.canvasElem.setAttribute('width', videoElem.videoWidth);
      this.canvasElem.setAttribute('height', videoElem.videoHeight);
    }
  },

  setMessage: function(message) {
    if (this.textOverlay !== null) {
      this.textOverlay.text(message);
    }
  },

  // Progress in [0,1]
  setProgress: function(percent) {
    this.progress.css('width', percent*100 + "%");
  },

  destroy: function() {
    // No memory leaks here!
    this.stopPreview();
    this.elem.remove();
    this.videoElem = null;
    this.canvasElem = null;
    this.textOverlay = null;
    this.counterContainer = null;
    this.photoButton = null;
    this.videoButton = null;
    this.takeButton = null;
    this.onselfie = null;
    this.progress = null;
  },

  setVideoDuration: function(val) {
    // Just to be careful, clamp 1-4
    this.videoDuration = Math.max(1, Math.min(parseInt(val), 4));
  },

  loadPreferences: function() {
    this.dynamic = localStorage.getItem('selfieDynamic') === 'true';
    this.setVideoDuration(localStorage.getItem('selfieVideoDuration') || "2");
  },

  savePreferences: function() {
    localStorage.setItem('selfieDynamic', this.dynamic ? 'true' : 'false');
    localStorage.setItem('selfieVideoDuration', this.videoDuration.toString());
  },

  setSelfieType: function(e) {
    if ((e.target === this.photoButton.get(0) &&
         !this.photoButton.hasClass('selected')) ||
        (e.target === this.videoButton.get(0) &&
         !this.videoButton.hasClass('selected'))) {
      this.videoButton.toggleClass('selected');
      this.photoButton.toggleClass('selected');
      this.dynamic = !this.dynamic;
      this.savePreferences();
    }
  },

  startPreview: function() {
    if (!this.videoElem) {
      return;
    }

    this.setMessage('Fetching camera stream...');

    var getUserMedia;
    if (typeof navigator.webkitGetUserMedia === 'function') {
      getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
    } else if (typeof navigator.mozGetUserMedia === 'function') {
      getUserMedia = navigator.mozGetUserMedia.bind(navigator);
    } else {
      getUserMedia = function() { alert("Your browser does not support camera input!"); };
    }

    getUserMedia({video: true}, (_stream) => {
      this.setMessage('');
      this.stream = _stream;
      this.videoElem.src = window.URL.createObjectURL(_stream);
    }, (e) => {
      this.setMessage("You don't have a camera available!");
    });
  },

  stopPreview: function() {
    if (this.stream !== null) {
      this.stream.getTracks()[0].stop();
    }
    this.stream = null;
  },

  snapSelfie: function(dynamic, takeSelfieCallback, fileCallback) {
    this.resizeCanvas(dynamic);
    var ctx = this.canvasElem.getContext('2d');
    this.selfieCountdown(
      3,
      takeSelfieCallback(this.videoElem, this.canvasElem, ctx, fileCallback));
  },

  selfieCountdown: function(count, callback) {
    if (count > 0) {
      this.counterContainer.html('<h3 class="count">' + count + '</h3>');
      setTimeout(() => this.selfieCountdown(count - 1, callback), 1000);
    } else {
      this.counterContainer.empty();
      if (!this.dynamic) {
        // Camera flash
        this.counterContainer.addClass('selfie-flash');
        setTimeout(() => this.counterContainer.removeClass('selfie-flash'), 1100);
      }
      callback();
    }
  }
};

// Just to be tidy, only allow one of these to exist at once. Clean up
// the old ones if we add a new one.
var selfieSingleton = null;

function GitHubSelfies() {
  this.selfiesTaken = 0;
  // Imgur client ID
  this.clientId = 'cc9df57988494ca';
  // This selector works on all pages
  this.insertAt = '.timeline-new-comment .form-actions:visible';
  this.buttons = null;
  this.textarea = null;
}

GitHubSelfies.prototype = {
  setupSelfieStream: function() {
    if (selfieSingleton !== null) {
      selfieSingleton.destroy();
      selfieSingleton = null;
    }
    selfieSingleton = this;

    var candidate = $(this.insertAt);
    if (candidate.length === 0) {
      // Try again later
      setTimeout(() => this.setupSelfieStream(), 250);
    } else {
      $('.form-actions-protip').hide();
      this.buttons = new GitHubSelfieButtons();
      this.buttons.insert(candidate);
      // TODO: this is too fragile!
      this.textarea = this.buttons.elem.parent().parent().find('textarea');
      this.setupEvents();
    }
  },

  destroy: function() {
    if (this.buttons !== null) {
      this.buttons.destroy();
    }
    this.buttons = null;
    this.textarea = null;
  },

  hideAllElements: function() {
    $('.github-selfies').addClass('hidden');
  },

  showAllElements: function() {
    $('.github-selfies').removeClass('hidden');
  },

  setupEvents: function() {
    this.buttons.onselfie = this.addSelfie.bind(this);
    $('.write-tab').on('click', this.showAllElements.bind(this));
    $('.preview-tab').on('click', this.hideAllElements.bind(this));
  },

  addSelfie: function(isDynamic) {
    var thisSelfieNumber = this.selfiesTaken++;

    var success = (res) => {
      this.replacePlaceholderInBody(thisSelfieNumber, res.data.link);
    };

    var imageSuccess = (_imageData) => {
      this.uploadSelfie(_imageData, success, (err) => {
        this.buttons.videoPreview.setMessage("Something went wrong :-(");
        console.error("Error uploading selfie", err);
      });
    };

    this.addSelfiePlaceholder(thisSelfieNumber);
    this.buttons.videoPreview.snapSelfie(
      isDynamic,
      isDynamic ? this.dynamicSelfie.bind(this) : this.staticSelfie.bind(this),
      imageSuccess);

  },

  staticSelfie: function(video, canvas, ctx, callback) {
    return function() {
      var imgBinary;

      ctx.save();
      // We used to flip this, but now the preview is just flipped in CSS.
      // Save the image non-mirrored so writing goes the right way.
      //ctx.translate(video.videoWidth, 0);
      //ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, video.videoWidth, video.videoHeight);
      imgBinary = canvas.toDataURL('/image/jpeg', 1).split(',')[1];
      ctx.restore();
      callback(imgBinary);
    };
  },

  dynamicSelfie: function(video, canvas, ctx, callback) {
    return () => {
      var fps = 15;
      var totalFrames = Math.floor(this.buttons.videoPreview.videoDuration * fps);
      var interval = Math.floor(1000 / fps);
      // Height and width must be integral or the LZWEncoder will hang
      var height = Math.floor(canvas.height);
      var width = Math.floor(canvas.width);
      var frames = [];
      var frameNum = 0;
      var lastFrameTime = 0;

      var addFrame = function (encoder, frame) {
        return () => {
          return new Promise(function (resolve, reject) {
            encoder.setDelay(frame[1]);
            if (encoder.addFrame(frame[0], true)) {
              resolve(encoder);
            } else {
              reject("Error adding frame");
            }
          });
        };
      };

      var makeGif = () => {
        var encoder = new GIFEncoder();
        encoder.setSize(width, height);
        encoder.setRepeat(0);
        encoder.start();
        var promise = Promise.resolve(true);
        for (var i = 0; i < frames.length; i++) {
          promise.then(addFrame(encoder, frames[i]));
        }
        return promise
          .then(() => {
            encoder.finish();
            frames = null;
            return encoder.stream().getData();
          })
          .then(encode64)
          .then(callback);
      };

      // We use requestAnimationFrame instead of setInterval so that
      // we are better sync'ed with the video.
      var captureFrame = () => {
        // schedule another frame right away
        var rafRequest = requestAnimationFrame(captureFrame);

        var frameTime = performance.now();
        var frameDelay = frameTime - lastFrameTime;
        // Limit to a set fps by skipping this callback unless the
        // interval is greater than what we want.
        if (frameDelay >= interval) {
          frameNum++;
          lastFrameTime = frameTime;
          if (frameNum === 1) {
            frameDelay = 0;
          }
          ctx.drawImage(video,
                        0, 0, video.videoWidth, video.videoHeight,
                        0, 0, width, height);
          frames.push([ctx.getImageData(0, 0, width, height).data, frameDelay]);
          this.buttons.videoPreview.setProgress(frameNum / totalFrames);
          if (frameNum >= totalFrames) {
            cancelAnimationFrame(rafRequest);
            makeGif().then(() => this.buttons.videoPreview.setProgress(0));
          }
        }
      };

      requestAnimationFrame(captureFrame);
    };
  },

  uploadSelfie: function(imageData, successCb, errorCb) {
    $.ajax({
      url  : 'https://api.imgur.com/3/upload',
      type : 'POST',
      beforeSend: (xhr) => {
        xhr.setRequestHeader('Authorization', 'Client-ID ' + this.clientId);
      },
      data: {
        type  : 'base64',
        image : imageData
      },
      dataType : 'json',
      success  : successCb,
      error    : errorCb
    });
  },

  addSelfiePlaceholder: function(number) {
    var currentContents = this.textarea.val();
    if (currentContents !== '') {
      this.textarea.val(currentContents + '\n');
    }
    this.textarea.val(currentContents + '[[selfie-' + number + ' uploading...]]\n');
  },

  replacePlaceholderInBody: function(number, link) {
    var toReplace = '[[selfie-' + number + ' uploading...]]';

    this.textarea.val(
      this.textarea.val()
        .replace(toReplace, '[![selfie-' + number + '](' + link + ')](https://github.com/thieman/github-selfies/)'));
    this.textarea.focus();
    // Cursor to end
    var textareaElem = this.textarea.get(0);
    var textareaLength = textareaElem.textLength;
    textareaElem.setSelectionRange(textareaLength, textareaLength);
  }
};
