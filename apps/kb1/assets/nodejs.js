// util function for processing the list value images
function processImages(self) {
  for (var c = 0; c < self.aValues.length; c++) {
    if (self.aValues[c].imageSrc) {
      self.aValues[c].aText = '<img src="assets/' + self.aValues[c].imageSrc + '" width="96" height="96" />';
    }
  }
}

// include the "adm-zip" module for zip creation (for upload)
var ADMzip = require("adm-zip");