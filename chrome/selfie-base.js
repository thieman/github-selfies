function GitHubSelfies(config) {

  var stream;

  config.buttonSelector   = '#totallyAwesomeSelfieButton';
  config.toggleSelector = '#selfieToggle';
  config.canvasSelector   = '#selfieCanvas';
  config.videoSelector    = '#selfieVideo';
  config.setupComplete    = false;
  config.selfiesTaken     = 0;
  config.interval         = 100;
  config.clientId         = 'cc9df57988494ca';
  config.stream           = null;

  config.toggleHTML = (
    '<button id="selfieToggle" type="button" class="button dark-grey">GIF?</button>'
  );

  config.videoHTML = (
    '<div class="selfieVideoContainer">' +
      '<div class="selfieProgressContainer"><div class="selfieProgress"></div></div>' +
      '<div class="selfie-countdown">' +
        '<div class="counter-container"></div>' +
        '<video autoplay id="selfieVideo" class="hideSelfieVideo"></video>' +
      '</div>' +
      '<p class="selfieVideoOverlay"></p>' +
      '<canvas id="selfieCanvas" class="hidden"></canvas>' +
    '</div>'
  );

  this.setupSelfieStream = function setupStream () {
    console.log('fire');
    var candidate;
    for (var i = 0; i < config.insertBefore.length; i++) {
      candidate = config.insertBefore[i] + ':visible';
      if ($(candidate).length !== 0) {
        break;
      }
      candidate = null;
    }
    if (candidate === null) { return setTimeout(function() { setupStream(); }, 250); }
    else {
      $('.form-actions-protip').hide();
      placeButton(candidate);
      placeToggle();
      placeVideo();
      setupEvents();
      config.setupComplete = true;
    }
  };

  function placeVideo () {
    if (typeof config.placeVideo === 'function') { config.placeVideo(config.videoHTML); }
    else { $(config.videoHTML).insertBefore(config.buttonSelector); }
  }

  function placeToggle () {
    if (typeof config.placeToggle === 'function') { config.placeToggle(config.toggleHTML, config.buttonSelector); }
    else { $(config.toggleHTML).insertBefore(config.buttonSelector); }
  }

  function placeButton (candidate) {
    $(config.buttonHTML).insertBefore(candidate);
  }

  function setupEvents () {
    $(config.buttonSelector).on('click', addSelfie);
    $(config.buttonSelector).hover(startVideo);
    $(config.toggleSelector).on('click', toggleDynamicSelfie);
    $('.write-tab').on('click', showElements);
    $('.preview-tab').on('click', hideElements);
  }

  function resizeCanvasElement (dynamic) {
    var video = document.querySelector(config.videoSelector);
    $(config.canvasSelector)
      .attr('height', video.videoHeight / (dynamic ? 3 : 1))
      .attr('width',  video.videoWidth / (dynamic ? 3 : 1));
  }

  function addSelfie (client) {
    var thisSelfieNumber = config.selfiesTaken++;

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

    var video  = document.querySelector(config.videoSelector)
      , canvas = document.querySelector(config.canvasSelector)
      , ctx    = canvas.getContext('2d');

    if (dynamic) { selfieCountdown(dynamicSelfie(video, canvas, ctx, callback)); }
    else { selfieCountdown(staticSelfie(video, canvas, ctx, callback)); }
  }

  function selfieCountdown (callback) {
    var countdown = $('.counter-container')
      , count     = 3

      , counter = setInterval(function () {
          if (count) {
            console.log(count)
            count -= 1
            $('.count').text(count)
          }
          else {
            clearInterval(counter)
            countdown.text('')
            callback()
          }
        }, 1000)
    countdown.append('<h3 class="count">' + count + '</h3>')
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
    }
  }

  function dynamicSelfie (video, canvas, ctx, callback) {
    return function () {
      var encoder = new GIFEncoder()
        , frame   = 0
        , clock;

      encoder.setRepeat(0);
      encoder.setDelay(config.interval);
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
      }, config.interval);
    }
  }

  function uploadSelfie (imageData, successCb, errorCb) {
    $.ajax({
      url  : 'https://api.imgur.com/3/upload',
      type : 'POST',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Client-ID ' + config.clientId);
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
    $(config.videoSelector ).remove();
    $(config.canvasSelector).remove();
    $(config.buttonSelector).prop('disabled', true);
    $(config.buttonSelector).children('span').remove();
    $(config.buttonSelector).text('Something broke :(');
    $(config.buttonSelector).addClass('danger');
  }

  function startVideo () {
    $('.selfieVideoOverlay').text('Fetching camera stream...');
    $(config.buttonSelector).attr('disabled', 'disabled');
    if (typeof config.preVideoStart === 'function') { config.preVideoStart(); }
    navigator.webkitGetUserMedia({video: true}, function(_stream) {
      var video;
      $(config.buttonSelector).removeAttr('disabled');
      $('.selfieVideoOverlay').text('');
      $(config.videoSelector).removeClass('hideSelfieVideo');
      video  = document.querySelector(config.videoSelector);
      stream = _stream;
      $(config.videoSelector).attr('src', window.URL.createObjectURL(stream));
      if (typeof config.postVideoStart === 'function') { config.postVideoStart(); }
    }, function() {});
  }

  function stopVideo () {
    $(config.videoSelector).addClass('hideSelfieVideo');
    stream.stop();
    stream = null;
    if (typeof config.postVideoStop === 'function') { config.postVideoStop(); }
  }

  function hideElements () {
    $(config.videoSelector ).addClass('hideSelfieVideo');
    $(config.buttonSelector).css('display', 'none');
    $(config.toggleSelector).css('display', 'none');
  }

  function showElements () {
    $(config.toggleSelector).css('display', 'inline-block');
    $(config.buttonSelector).css('display', 'inline-block');
  }

  function toggleDynamicSelfie() {
    if ($(config.toggleSelector).hasClass('selected')) {
      $(config.toggleSelector).removeClass('selected');
      $(config.toggleSelector).addClass('dark-grey');
      $(config.toggleSelector).removeClass('primary');
      $(config.toggleSelector).text('GIF?');
      $('#totallyAwesomeSelfieIcon').removeClass('octicon-device-camera-video');
      $('#totallyAwesomeSelfieIcon').addClass('octicon-device-camera');
    } else {
      $(config.toggleSelector).addClass('selected');
      $(config.toggleSelector).removeClass('dark-grey');
      $(config.toggleSelector).addClass('primary');
      $(config.toggleSelector).text('GIF!');
      $('#totallyAwesomeSelfieIcon').removeClass('octicon-device-camera');
      $('#totallyAwesomeSelfieIcon').addClass('octicon-device-camera-video');
    }
  }
}
