var pageMod = require('sdk/page-mod');
var self = require('sdk/self');
var {Cc, Ci} = require("chrome");

pageMod.PageMod({
  include: "*.github.com",
  contentStyleFile: [self.data.url("selfie.css")],
  contentScriptFile: [
    "jquery.min.js",
    "b64.js",
    "NeuQuant.js",
    "LZWEncoder.js",
    "GIFEncoder.js",
    "selfie-base.js",
    "selfie.js"
  ].map((path) => self.data.url(path))
});

// Modify CSP headers from Github so we can inject a script to forward
// pushState info via postMessage.
var httpRequestObserver =
{
  observe: function(subject, topic, data) {
    if (topic == "http-on-examine-response") {
      var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
      if (/^https:\/\/github.com/.test(httpChannel.name)) {
        var csp = httpChannel.getResponseHeader('CONTENT-SECURITY-POLICY').toString();
        csp = csp.replace("script-src", "script-src 'unsafe-inline'");
        httpChannel.setResponseHeader('CONTENT-SECURITY-POLICY', csp, false);
      }
    }
  }
};
var observerService = Cc["@mozilla.org/observer-service;1"]
                                .getService(Ci.nsIObserverService);
observerService.addObserver(httpRequestObserver, "http-on-examine-response", false);

exports.onUnload = function (reason) {
  observerService.removeObserver(httpRequestObserver, "http-on-examine-response");
};
