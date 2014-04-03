function GitHubSelfies(config) {

  var stream;

  config.buttonSelector   = '#totallyAwesomeSelfieButton';
  config.checkBoxSelector = '.selfieCheckBoxContainer';
  config.canvasSelector   = '#selfieCanvas';
  config.videoSelector    = '#selfieVideo';
  config.setupComplete    = false;
  config.selfiesTaken     = 0;
  config.interval         = 100;
  config.clientId         = 'cc9df57988494ca';
  config.stream           = null;

  config.checkboxHTML = (
    '<div class="selfieCheckBoxContainer">' +
      '<label id="selfieToggleLabel" for="selfieToggle">Gif</label>' +
      '<input type="checkbox" id="selfieToggle">' +
    '</div>'
  );

  config.videoHTML = (
    '<div class="selfieVideoContainer">' +
      '<div class="selfieProgressContainer"><div class="selfieProgress"></div></div>' +
      '<video autoplay id="selfieVideo" class="hideSelfieVideo"></video>' +
      '<p class="selfieVideoOverlay"></p>' +
      '<canvas id="selfieCanvas" class="hidden"></canvas>' +
    '</div>'
  );

  this.setupSelfieStream = function setupStream () {
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
      placeVideo();
      placeButton(candidate);
      placeCheckBox();
      setupEvents();
      config.setupComplete = true;
    }
  };

  function placeVideo () {
    if (typeof config.placeVideo === 'function') { config.placeVideo(config.videoHTML); }
    else { $(config.videoHTML ).insertBefore(config.buttonSelector); }
  }

  function placeCheckBox () {
    if (typeof config.placeCheckBox === 'function') { config.placeCheckBox(config.checkboxHTML, config.buttonSelector); }
    else { $(config.checkboxHTML).insertBefore(config.buttonSelector); }
  }

  function placeButton (candidate) {
    $(config.buttonHTML).insertBefore(candidate);
  }

  function setupEvents () {
    $(config.buttonSelector).on('click', addSelfie);
    $(config.buttonSelector).hover(startVideo);
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
    dynamic = $('#selfieToggle').is(':checked');
    resizeCanvasElement(dynamic);

    var video  = document.querySelector(config.videoSelector)
      , canvas = document.querySelector(config.canvasSelector)
      , ctx    = canvas.getContext('2d');

    if (dynamic) { dynamicSelfie(video, canvas, ctx, callback); }
    else { staticSelfie(video, canvas, ctx, callback); }
  }

  function staticSelfie (video, canvas, ctx, callback) {
    var imgBinary;

    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, video.videoWidth, video.videoHeight);
    imgBinary = canvas.toDataURL('/image/jpeg', 1).split(',')[1];
    callback(imgBinary);
  }

  function dynamicSelfie (video, canvas, ctx, callback) {
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
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, video.videoWidth / 3, video.videoHeight / 3);
        encoder.addFrame(ctx);
        frame++;
        $('.selfieProgress').css('width', (videoWidth / totalFrames) * frame);
      }
    }, config.interval);
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
    });
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
    $(config.checkBoxSelector).css('display', 'none');
  }

  function showElements () {
    $(config.checkBoxSelector).css('display', 'inline-block');
    $(config.buttonSelector).css('display', 'inline-block');
  }
}
