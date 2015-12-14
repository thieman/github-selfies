var pageMod = require('sdk/page-mod');
var self = require('sdk/self');

pageMod.PageMod({
  include: /github\.com/,
  contentScriptFile: [self.data.url("jquery.min.js"),
                      self.data.url("selfie-base.js"),
                      self.data.url("selfie.js")]
});
