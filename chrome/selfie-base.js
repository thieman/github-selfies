// function GitHubSelfies(insertBefore, bodySelector, buttonSelector, videoSelector, canvasSelector, buttonHTML, videoHTML, canvasHTML) {
function GitHubSelfies(config) {

  var stream;

  config.buttonSelector = '#totallyAwesomeSelfieButton';
  config.canvasSelector = '#selfieCanvas';
  config.videoSelector  = '#selfieVideo';
  config.setupComplete  = false;
  config.selfiesTaken   = 0;
  config.canvasHTML     = '<canvas id="selfieCanvas" class="hidden"></canvas>',
  config.videoHTML      = (
    '<div class="selfieVideoContainer">' +
      '<video autoplay id="selfieVideo" class="hideSelfieVideo"></video>' +
      '<p class="selfieVideoOverlay"></p>' +
    '</div>'
  ),
  config.interval       = 100;
  config.clientId       = 'cc9df57988494ca';
  config.stream         = null;

  this.setupSelfieStream = function setupStream () {
    var candidate;
    for (var i = 0; i < config.insertBefore.length; i++) {
      candidate = config.insertBefore[i];
      if ($(candidate).length !== 0) {
        break;
      }
      candidate = null;
    }

    if (candidate === null) {
      return setTimeout(function() { setupStream(); }, 250);
    }

    $(config.buttonHTML).insertBefore(candidate);

    if (typeof config.placeVideo === 'function') {
      config.placeVideo(config.videoHTML, config.canvasHTML);
    }
    else {
      $(config.canvasHTML).insertBefore(config.buttonSelector);
      $(config.videoHTML ).insertBefore(config.buttonSelector);
    }

    $(config.buttonSelector).on('click', addSelfie);
    $(config.buttonSelector).hover(startVideo, stopVideo);

    $('.write-tab').on('click',   showElements);
    $('.preview-tab').on('click', hideElements);

    config.setupComplete = true;
  };

  function resizeCanvasElement () {
    var video = document.querySelector(config.videoSelector);
    $(config.canvasSelector).attr('height', video.videoHeight);
    $(config.canvasSelector).attr('width', video.videoWidth);
  }

  function addSelfie (client) {
    var thisSelfieNumber = config.selfiesTaken++
      , imageData        = snapSelfie();

    addSelfiePlaceholder(thisSelfieNumber);
    uploadSelfie(imageData, success, this.notifyFail);

    function success (res) {
      replacePlaceholderInBody(thisSelfieNumber, res.data.link);
    }
  }

  function snapSelfie () {
    resizeCanvasElement();

    var video  = document.querySelector(config.videoSelector)
      , canvas = document.querySelector(config.canvasSelector)
      , ctx    = canvas.getContext('2d');

    return staticSelfie(video, canvas, ctx);
  }

  function staticSelfie (video, canvas, ctx) {
    var imgBinary;

    ctx.drawImage(video, 0, 0);
    imgBinary = canvas.toDataURL('/image/jpeg', 1).split(',')[1];

    return imgBinary;
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
    $('.selfieVideoOverlay').text('Fetching camera stream...')
    navigator.webkitGetUserMedia({video: true}, function(_stream) {
      var video;

      $('.selfieVideoOverlay').text('')
      $(config.videoSelector).removeClass('hideSelfieVideo');
      video  = document.querySelector(config.videoSelector);
      stream = _stream;
      $(config.videoSelector).attr('src', window.URL.createObjectURL(stream));
      if (typeof config.postVideoStart === 'function') {
        config.postVideoStart();
      }
    });
  }

  function stopVideo () {
    console.log(config.videoSelector);
    $(config.videoSelector).addClass('hideSelfieVideo');
    stream.stop();
    stream = null;
  }

  function hideElements () {
    console.log('hide elements');
    $(config.videoSelector ).addClass('hideSelfieVideo');
    $(config.buttonSelector).css('display', 'none');
  }

  function showElements () {
    console.log('show elements');
    // $(config.videoSelector ).removeClass('hideSelfieVideo');
    $(config.buttonSelector).css('display', 'inline-block');
  }

}
