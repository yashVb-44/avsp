const fs = require('fs');
const path = require('path');

// Global function to remove unwanted images
const removeUnwantedImages = (imagePaths) => {
    imagePaths.forEach((imagePath) => {
        try {
            fs.unlink(path.join(__dirname, '..', imagePath), (err) => {
                if (err) console.error(`Failed to delete image: ${imagePath}`, err);
            });
        } catch (error) {
            console.log(error)
        }
    });
};

module.exports = removeUnwantedImages;
