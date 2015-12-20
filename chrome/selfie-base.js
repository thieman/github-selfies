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
  // TODO: remember preference?

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
    var scalefactor = 1 / (isDynamic ? 3 : 1);
    this.canvasElem.setAttribute('height', Math.round(this.videoElem.videoHeight * scalefactor));
    this.canvasElem.setAttribute('width', Math.round(this.videoElem.videoWidth * scalefactor));
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

  setSelfieType: function(e) {
    if ((e.target === this.photoButton.get(0) &&
         !this.photoButton.hasClass('selected')) ||
        (e.target === this.videoButton.get(0) &&
         !this.videoButton.hasClass('selected'))) {
      this.videoButton.toggleClass('selected');
      this.photoButton.toggleClass('selected');
      this.dynamic = !this.dynamic;
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
  // Milliseconds between frames in a GIF. Yields ~10fps.
  this.interval = 100;
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
      var frame = 0;
      var clock;
      var totalFrames = 20;
      var frames = [];
      // Height and width must be integral or the LZWEncoder will hang
      var height = Math.floor(video.videoHeight / 3);
      var width = Math.floor(video.videoWidth / 3);

      var makeGif = () => {
        var encoder = new GIFEncoder();
        encoder.setSize(width, height);
        encoder.setRepeat(0);
        encoder.setDelay(this.interval);
        encoder.start();
        for (var i = 0; i < frames.length; i++) {
          encoder.addFrame(frames[i], true);
        }
        encoder.finish();
        frames = null;
        var binaryGif = encoder.stream().getData();
        callback(encode64(binaryGif));
      };

      clock = setInterval(() => {
        ctx.drawImage(video,
                      0, 0, video.videoWidth, video.videoHeight,
                      0, 0, width, height);
        frames.push(ctx.getImageData(0, 0, width, height).data);
        frame++;
        this.buttons.videoPreview.setProgress(frame / totalFrames);

        if (frame >= totalFrames) {
          clearInterval(clock);
          makeGif();
          this.buttons.videoPreview.setProgress(0);
        }
      }, this.interval);
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
    this.textarea.val(currentContents + '[[selfie-placeholder-' + number + ']]\n');
  },

  replacePlaceholderInBody: function(number, link) {
    var toReplace = '[[selfie-placeholder-' + number + ']]';

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
