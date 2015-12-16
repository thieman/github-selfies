(function() {
  "use strict";

  // Inject the code from fn into the page, in an IIFE.
  function inject(fn) {
    var script = document.createElement('script');
    var parent = document.documentElement;
    script.textContent = '('+ fn +')();';
    parent.appendChild(script);
    parent.removeChild(script);
  }

  // Post a message whenever history.pushState is called. GitHub uses
  // pushState to implement page transitions without full page loads.
  // This needs to be injected because content scripts run in a sandbox.
  inject(function() {
    var pushState = history.pushState;
    history.pushState = function on_pushState() {
      window.postMessage('selfie:pageUpdated', '*');
      return pushState.apply(this, arguments);
    };
  });

  var allowedPaths = [
    // New issues
    /github.com\/[\w\-]+\/[\w\-]+\/issues\/new/,
    // Existing issues (comment)
    /github.com\/[\w\-]+\/[\w\-]+\/issues\/\d+/,
    // New pull request
    /github.com\/[\w\-]+\/[\w\-]+\/compare/,
    // Existing pull requests (comment)
    /github.com\/[\w\-]+\/[\w\-]+\/pull\/\d+/
  ];

  // Return true if predicate(item) returns true for any item in array.
  function any(array, predicate) {
    for (var i = 0; i < array.length; i++) {
      if (predicate(array[i])) {
        return true;
      }
    }
    return false;
  }

  function addSelfies() {
    if (!any(allowedPaths, function(path) {
      return path.test(window.location.href); })) {
      // No selfies here!
      console.log("This path isn't appropriate for selfies.", window.location.href);
      return;
    }

    if (document.getElementById('totallyAwesomeSelfieButton')) {
      console.log("Already got selfies");
      return;
    }
    console.log("Adding selfies to:", window.location.href);

    var client = new GitHubSelfies({
      insertAt: ['.timeline-new-comment .form-actions']
    });
    client.setupSelfieStream();
  }

  // Add selfies when the extension is loaded into the page,
  // and whenever we push/pop new pages.
  window.addEventListener("message", function(event) {
    if (event.data === 'selfie:pageUpdated') {
      addSelfies();
    }
  });
  window.addEventListener("popstate", addSelfies);
  addSelfies();

  console.log('Selfie loaded!');
})();
