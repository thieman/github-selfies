function GitHubSelfies(config) {
  var stream = null;

  var buttonSelector = '#totallyAwesomeSelfieButton';
  var toggleSelector = '#selfieToggle';
  var canvasSelector = '#selfieCanvas';
  var videoSelector  = '#selfieVideo';
  var selfiesTaken   = 0;
  var interval       = 100;
  var clientId       = 'cc9df57988494ca';
  var hiddenClass = "github-selfies--hidden";

  var videoHTML = (
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

  var buttonsHTML = (
    '<div class="github-selfies github-selfies--selfieControls">' +
      '<button id="selfieToggle" type="button" class="btn btn-default">Video instead</button>' +
      '<button id="totallyAwesomeSelfieButton" type="button" class="btn btn-default">' +
        '<span class="octicon octicon-device-camera"></span>' +
        ' Selfie!' +
      '</button>' +
    '</div>'
  );

  // TODO: "close" button
  // TODO: move status overlay

  // TODO: build component object w/ elems for buttons, video

  this.setupSelfieStream = function setupSelfieStream () {
    // TODO: gotta clean up previous stuff! close video, etc
    var candidate;
    for (var i = 0; i < config.insertBefore.length; i++) {
      candidate = config.insertBefore[i] + ':visible';
      console.log("Looking for candidate", candidate, $(candidate));
      if ($(candidate).length !== 0) {
        break;
      }
      candidate = null;
    }
    if (candidate === null) {
      setTimeout(function() { setupSelfieStream(); }, 250);
    } else {
      $('.form-actions-protip').hide();
      var buttons = placeButtons(candidate);
      //placeVideo();
      setupEvents(buttons);
    }
  };

  function placeVideo (buttons) {
    console.log("Placing video before", buttons);
    var video = $(videoHTML);
    video.insertBefore(buttons);
    return video;
  }

  function placeButtons (candidate) {
    console.log("placing buttons before", $(candidate));

    var buttons = $(buttonsHTML);
    buttons.insertBefore(candidate);
    return buttons;
  }

  function setupEvents (buttons) {
    buttons.find(buttonSelector)
      //.on('click', addSelfie) // TODO: new button for this?
      .on('click', function() { startVideo(buttons); });
    buttons.find(toggleSelector).on('click', toggleDynamicSelfie);
    $('.write-tab').on('click', showElements);
    $('.preview-tab').on('click', hideElements);
  }

  function resizeCanvasElement (dynamic) {
    var video = document.querySelector(videoSelector);
    $(canvasSelector)
      .attr('height', video.videoHeight / (dynamic ? 3 : 1))
      .attr('width',  video.videoWidth / (dynamic ? 3 : 1));
  }

  function addSelfie (client) {
    var thisSelfieNumber = selfiesTaken++;

    addSelfiePlaceholder(thisSelfieNumber);
    snapSelfie(imageSuccess);

    function imageSuccess (_imageData) {
      uploadSelfie(_imageData, success, notifyFail);
    }

    function success (res) {
      replacePlaceholderInBody(thisSelfieNumber, res.data.link);
    }
  }

  function snapSelfie (callback) {
    dynamic = $('#selfieToggle').hasClass('selected');
    resizeCanvasElement(dynamic);

    var video  = document.querySelector(videoSelector)
      , canvas = document.querySelector(canvasSelector)
      , ctx    = canvas.getContext('2d');

    if (dynamic) { selfieCountdown(dynamicSelfie(video, canvas, ctx, callback)); }
    else { selfieCountdown(staticSelfie(video, canvas, ctx, callback)); }
  }

  function selfieCountdown (callback) {
    var countdown = $('.counter-container')
      , count     = 3

      , counter = setInterval(function () {
          if (count) {
            count -= 1;
            $('.count').text(count);
          }
          else {
            clearInterval(counter);
            countdown.text('');
            callback();
          }
      }, 1000);
    countdown.append('<h3 class="count">' + count + '</h3>');
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
      var encoder = new GIFEncoder()
        , frame   = 0
        , clock;

      encoder.setRepeat(0);
      encoder.setDelay(interval);
      encoder.start();

      clock = setInterval(function () {
        var videoWidth  = $(video).width()
          , totalFrames = 20
          , binaryGif
          , dataUrl;

        if (frame >= totalFrames) {
          encoder.finish();
          binaryGif = encoder.stream().getData();
          dataUrl   = 'data:image/gif;base64,'+ encode64(binaryGif);
          callback(encode64(binaryGif));
          clearInterval(clock);
          $('.selfieProgress').css('width', 0);
        }
        else {
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
    if ($(config.bodySelector).val() !== '') {
      $(config.bodySelector).val($(config.bodySelector).val() + '\n');
    }
    $(config.bodySelector).val($(config.bodySelector).val() + '[[selfie-placeholder-' + number + ']]\n');
  }

  function replacePlaceholderInBody (number, link) {
    var textarea  = document.querySelector(config.bodySelector)
      , toReplace = '[[selfie-placeholder-' + number + ']]';

    $(config.bodySelector)
      .val($(config.bodySelector)
      .val()
      .replace(toReplace, '![selfie-' + number + '](' + link + ')'));

    textarea.focus();
    textarea.setSelectionRange(textarea.textLength, textarea.textLength);
  }

  function notifyFail () {
    $(videoSelector).remove();
    $(canvasSelector).remove();
    $(buttonSelector)
      .prop('disabled', true)
      .text('Something broke :(')
      .addClass('btn-danger')
      .children('span').remove();
  }

  function startVideo (buttons) {
    // TODO: insert video
    placeVideo(buttons);

// TODO: handle video stream events

    $('.github-selfies--selfieVideoContainer').removeClass(hiddenClass);
    $('.selfieVideoOverlay').text('Fetching camera stream...');
    $(buttonSelector).prop('disabled', true);
    if (typeof config.preVideoStart === 'function') { config.preVideoStart(); }

    var getUserMedia;
    if (typeof navigator.webkitGetUserMedia === 'function') {
      getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
    } else if (typeof navigator.mozGetUserMedia === 'function') {
      getUserMedia = navigator.mozGetUserMedia.bind(navigator);
    } else {
      getUserMedia = function () { alert("Your browser does not support camera input!"); };
    }

    getUserMedia({video: true}, function(_stream) {
      $(buttonSelector).prop('disabled', false);
      $('.selfieVideoOverlay').text('');
      $(videoSelector).removeClass(hiddenClass);
      var video = document.querySelector(videoSelector);
      stream = _stream;
      video.src = window.URL.createObjectURL(_stream);
      console.log("Video:", video, video.src, stream);
      if (typeof config.postVideoStart === 'function') { config.postVideoStart(); }
    }, function(e) {
      if (e.name === 'DevicesNotFoundError') {
        $(buttonSelector).prop('disabled', false);
        $('.selfieVideoOverlay').text("You don't have a camera available!");
        // TODO: no camera connected
      } else {
        console.error("Couldn't start selfie video", e);
        notifyFail();
      }
    });
  }

  function stopVideo () {
    $(videoSelector).addClass('hideSelfieVideo');
    stream.stop();
    stream = null;
    if (typeof config.postVideoStop === 'function') { config.postVideoStop(); }
  }

  function hideElements () {
    $('.github-selfies').addClass(hiddenClass);
  }

  function showElements () {
    $('.github-selfies').removeClass(hiddenClass);
  }

  function toggleDynamicSelfie() {
    var selfieButton = $('#totallyAwesomeSelfieIcon');
    var toggleButton = $(toggleSelector);
    if (toggleButton.hasClass('selected')) {
      toggleButton.text('Video instead');
    } else {
      toggleButton.text('Photo instead');
    }
    selfieButton.toggleClass('octicon-device-camera octicon-device-camera-video');
    toggleButton.toggleClass('selected dark-grey');
  }
}
