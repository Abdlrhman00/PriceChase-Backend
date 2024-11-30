const fs = require("fs");

module.exports = (filePath) => {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting photo:", err.message);
    });
};