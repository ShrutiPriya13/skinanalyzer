const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const sharp = require('sharp');

// Load model from Google Drive
async function loadModel() {
    try {
        const drive = google.drive({
            version: 'v3',
            auth: new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_CLIENT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                },
                scopes: ['https://www.googleapis.com/auth/drive.readonly']
            })
        });

        const response = await drive.files.get({
            fileId: '171215i93068Xq451t09o23s45890234567890', // Your model file ID
            alt: 'media'
        });

        const modelPath = path.join(__dirname, 'model.json');
        fs.writeFileSync(modelPath, response.data);
        return await tf.loadGraphModel(`file://${modelPath}`);
    } catch (error) {
        console.error('Error loading model:', error);
        throw error;
    }
}

// Initialize model
let model;
loadModel().then(m => {
    model = m;
    console.log('Model loaded successfully');
}).catch(error => {
    console.error('Failed to load model:', error);
});

// Image prediction
async function predictImage(req, res) {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Process the image
        const processedImage = await sharp(file.path)
            .resize(224, 224)
            .toFormat('jpeg')
            .toBuffer();

        // Convert to tensor
        const tensor = tf.node.decodeImage(processedImage);
        const normalized = tensor.div(255);
        const batched = normalized.expandDims(0);

        // Make prediction
        const prediction = await model.predict(batched);
        const predictedClass = prediction.argMax(1).dataSync()[0];
        const skinTypes = ['Dry Skin', 'Oily Skin', 'Normal Skin', 'Combination Skin'];
        const predictedType = skinTypes[predictedClass];

        // Clean up
        fs.unlinkSync(file.path);
        tensor.dispose();
        normalized.dispose();
        batched.dispose();
        prediction.dispose();

        // Return prediction and recommendations
        res.json({
            skin_type: predictedType,
            confidence: prediction.dataSync()[predictedClass],
            recommendations: {
                skin_type: predictedType,
                recommended_products: []
            }
        });
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: 'Failed to process image' });
    }
}

// Questionnaire prediction
async function predictQuestionnaire(req, res) {
    try {
        const { skin_feel, breakout_frequency, tight_flaky, pores, sun_reaction } = req.body;
        const scores = {
            skin_feel: parseInt(skin_feel),
            breakout_frequency: parseInt(breakout_frequency),
            tight_flaky: parseInt(tight_flaky),
            pores: parseInt(pores),
            sun_reaction: parseInt(sun_reaction)
        };

        // Simple scoring system
        let dryScore = scores.skin_feel === 1 ? 2 : 0;
        dryScore += scores.tight_flaky === 1 ? 2 : 0;
        dryScore += scores.pores === 2 ? 1 : 0;

        let oilyScore = scores.skin_feel === 2 ? 2 : 0;
        oilyScore += scores.breakout_frequency === 3 ? 2 : 0;
        oilyScore += scores.pores === 1 ? 2 : 0;

        let normalScore = scores.skin_feel === 3 ? 2 : 0;
        normalScore += scores.pores === 2 ? 1 : 0;

        let combinationScore = scores.skin_feel === 4 ? 2 : 0;
        combinationScore += scores.pores === 3 ? 1 : 0;

        const scoresArray = [dryScore, oilyScore, normalScore, combinationScore];
        const maxScore = Math.max(...scoresArray);
        const skinTypes = ['Dry Skin', 'Oily Skin', 'Normal Skin', 'Combination Skin'];
        const predictedType = skinTypes[scoresArray.indexOf(maxScore)];

        // Return prediction and recommendations
        res.json({
            skin_type: predictedType,
            scores: {
                dry: dryScore,
                oily: oilyScore,
                normal: normalScore,
                combination: combinationScore
            },
            recommendations: {
                skin_type: predictedType,
                recommended_products: []
            }
        });
    } catch (error) {
        console.error('Questionnaire error:', error);
        res.status(500).json({ error: 'Failed to process questionnaire' });
    }
}

module.exports = {
    predictImage,
    predictQuestionnaire
};
