(function() {

    var selfieStream = null;

    var selfieButton = '<button class="button totallyAwesomeSelfieButton" style="position: absolute; right: 10px; bottom: 55px; width: 158px; left: 10px;"><span class="octicon octicon-device-camera" style="font-size: 20px; margin-right: 5px;"></span>Add a Selfie</button>'
    $(selfieButton).insertBefore('.composer-submit');

    var setupSelfieStream = function() {
        navigator.webkitGetUserMedia({video: true}, function(stream) {
            selfieStream = stream;
            console.log(selfieStream);
        });
    };

    var snapSelfie = function() {
        return;
    };

    var addSelfie = function() {
        if (selfieStream === undefined || selfieStream === null) {
            return;
        }
        var selfie = snapSelfie();
    };

    setupSelfieStream();
    $('.totallyAwesomeSelfieButton').on('click', addSelfie);

})();
