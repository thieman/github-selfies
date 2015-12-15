// TODO: Test in the other locations

// Create a selfie button in the given form.
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

  // This passthrough sucks
  this.onselfie = function (isDynamic, video, canvas, ctx, callback) {};

  this.selfieButton
    .on('click', function() {
      if (this.videoPreview === null) {
        this.showVideoPreview();
        //this.disableButton();
        this.selfieButton.addClass('selected');
        this.videoPreview.startPreview();
      } else {
        this.videoPreview.destroy();
        this.videoPreview = null;
        this.selfieButton.removeClass('selected');
      }
    }.bind(this));
}

GitHubSelfieButtons.prototype = {
  insert: function(element) {
    // TODO: there can be only one
    // Be careful not to insert more than once!
    this.elem.eq(0).insertAfter(element);
    return this;
  },

  hide: function() {
    this.elem.addClass('hidden');
    return this;
  },
  show: function() {
    this.elem.removeClass('hidden');
    return this;
  },

  destroy: function() {
    this.elem.remove();
    this.selfieButton = null;
    this.videoPreview.destroy();
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
    this.videoPreview.show();
    return this;
  },
  disableButton: function() {
    this.selfieButton.prop('disabled', true);
    return this;
  },
  enableButton: function() {
    this.selfieButton.prop('disabled', false);
    return this;
  },

  // TODO: unused?
  hideVideoPreview: function() {
    if (this.videoPreview !== null) {
      this.videoPreview.hide();
      // TODO: destroy??
    }
    return this;
  }
};

function GitHubSelfieVideoPreview() {
  this.elem = $(
    '<div class="github-selfies selfieVideoContainer hidden">' +
    '<div class="selfieProgressContainer"><div class="selfieProgress"></div></div>' +
    '<div class="selfie-countdown">' +
    '<div class="counter-container"></div>' +
    '<video autoplay id="selfieVideo"></video>' +
    '</div>' +
    '<p class="selfieVideoOverlay">Click to take a selfie!</p>' +
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

  this.onselfie = function (isDynamic, video, canvas, ctx, callback) {};

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
    .on('click', function() { this.onselfie(this.dynamic); }.bind(this));
  this.stream = null;
  this.dynamic = false; // dynamic == video
  // TODO: remember preference?
}

GitHubSelfieVideoPreview.prototype = {
  insert: function(element) {
    // TODO: there can be only one
    // Be careful not to insert more than once!
    this.elem.eq(0).insertBefore(element);
    return this;
  },

  resizeCanvas: function(isDynamic) {
    this.canvasElem.setAttribute('height', this.videoElem.videoHeight / (isDynamic ? 3 : 1));
    this.canvasElem.setAttribute('width', this.videoElem.videoWidth /  (isDynamic ? 3 : 1));
    return this;
  },

  // TODO: unused?
  hide: function() {
    this.elem.addClass('hidden');
    return this;
  },
  show: function() {
    this.elem.removeClass('hidden');
    return this;
  },

  setMessage: function(message) {
    this.textOverlay.text(message);
    return this;
  },

  // TODO: fold into destroy?
  stopPreview: function() {
    if (this.stream !== null) {
      this.stream.getTracks()[0].stop();
    }
    this.stream = null;
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
      //buttons.enableButton();
      // TODO: disable/enable buttons
      // TODO: don't show until this works?
      this.setMessage('');
      this.stream = _stream;
      this.videoElem.src = window.URL.createObjectURL(_stream);
    }.bind(this), function(e) {
      this.setMessage("You don't have a camera available!");
    }.bind(this));
  },

  snapSelfie: function(dynamic, takeSelfieCallback, fileCallback) {
    this.resizeCanvas(dynamic);
    var ctx = this.canvasElem.getContext('2d');
    this.selfieCountdown(takeSelfieCallback(this.videoElem, this.canvasElem, ctx, fileCallback));
  },

  // TODO: de-classify this

  showCount: function (count, callback) {
    if (count > 0) {
      this.counterContainer.html('<h3 class="count">' + count + '</h3>');
      setTimeout(function() { this.showCount(count - 1, callback); }.bind(this), 1000);
    } else {
      this.counterContainer.empty();
      if (!this.dynamic) {
        // Camera flash
        this.counterContainer.addClass('selfie-flash');
        setTimeout(function() {
          this.counterContainer.removeClass('selfie-flash');
        }.bind(this), 1100);
      }
      callback();
    }
  },
  selfieCountdown: function(callback) {
    this.showCount(3, callback);
  }
};


function GitHubSelfies(config) {
  var selfiesTaken   = 0;
  var interval       = 100;
  var clientId       = 'cc9df57988494ca';
  var buttons = null;

  // TODO: move status overlay & countdown

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
      buttons.insert(candidate);
      setupEvents(buttons);
    }
  };

  function hideElements () {
    $('.github-selfies').addClass('hidden');
  }

  function showElements () {
    $('.github-selfies').removeClass('hidden');
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
      uploadSelfie(_imageData, success, function(err) {
        buttons.setMessage("Something went wrong :-(");
        console.log("Error uploading selfie", err);
      });
    }

    function success (res) {
      replacePlaceholderInBody(thisSelfieNumber, res.data.link);
    }
  }

  function staticSelfie (video, canvas, ctx, callback) {
    return function () {
      var imgBinary;

      ctx.save();
      // We used to flip this, but now the preview is just flipped in CSS.
      // Save the image non-mirrored so writing goes the right way.
      //ctx.translate(video.videoWidth, 0);
      //ctx.scale(-1, 1);
      // TODO: scale the image? it's pretty big
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

      // TODO: requestanimationFrame
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
          // TODO: pipe this back to the UI object
          $('.selfieProgress').css('width', 0);
        } else {
          ctx.save();
          // We used to flip this, but now the preview is just flipped in CSS.
          // Save the image non-mirrored so writing goes the right way.
          //ctx.translate(video.videoWidth / 3, 0);
          //ctx.scale(-1, 1);
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
    var currentContents = textarea.val();
    if (currentContents !== '') {
      textarea.val(currentContents + '\n');
    }
    textarea.val(currentContents + '[[selfie-placeholder-' + number + ']]\n');
  }

  function replacePlaceholderInBody (number, link) {
    var textarea = buttons.elem.parent().parent().prev().find('textarea');
    var toReplace = '[[selfie-placeholder-' + number + ']]';

    textarea.val(
      textarea.val()
        .replace(toReplace, '![selfie-' + number + '](' + link + ')'));
    textarea.focus();
    textarea.get(0).setSelectionRange(textarea.textLength, textarea.textLength);
  }
}
