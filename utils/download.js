const fs = require('fs');
const axios = require('axios');
const path = require('path');

const downloadImage = async (url) => {
    try {
        const filePath = `uploads/${Date.now()}_${(new URL(url)).host}.jpg`
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve(filePath));
            writer.on('error', reject(null));
        });
    } catch (error) {
        console.error('Error downloading the image:', error);
        return null
    }
};

module.exports = downloadImage