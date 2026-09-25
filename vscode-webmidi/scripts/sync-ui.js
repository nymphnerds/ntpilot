"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const media = path.resolve(__dirname, "..", "media");
for (const name of ["index.html", "styles.css", "app.js", "web-midi-transport.js"]) {
  fs.copyFileSync(path.join(root, name), path.join(media, name));
}
