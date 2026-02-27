const sharp = require('sharp');
const fs = require('fs');

async function convert() {
    try {
        console.log('Converting icon.png (JPEG) to actual PNG...');
        const buffer = await sharp('assets/icon.png')
            .png()
            .toBuffer();

        fs.writeFileSync('assets/icon.png', buffer);
        console.log('Success! assets/icon.png is now a valid PNG.');
    } catch (error) {
        console.error('Error converting icon:', error);
        process.exit(1);
    }
}

convert();
