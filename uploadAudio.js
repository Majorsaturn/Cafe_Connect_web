const { uploadAudio } = require('./mongodb'); // Ensure uploadAudio is exported in mongodb.js
const path = require('path');

(async () => {
    try {
        // Specify the local path to the audio file
        const audioPath = path.join(__dirname, '/audios/CafeCalm.wav');
        const fileName = 'CafeCalm.wav';

        // Call the uploadAudio function
        const result = await uploadAudio(audioPath, fileName);

        console.log('Audio uploaded successfully:', result);
    } catch (error) {
        console.error('Error uploading audio:', error.message);
    }
})();
