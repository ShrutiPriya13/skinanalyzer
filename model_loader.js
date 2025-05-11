const tf = require('@tensorflow/tfjs-node');

async function loadModel() {
    try {
        const modelUrl = process.env.MODEL_URL;
        if (!modelUrl) {
            throw new Error('MODEL_URL environment variable is not set');
        }
        
        console.log('Loading model from:', modelUrl);
        const model = await tf.loadLayersModel(modelUrl);
        console.log('✅ Model loaded successfully');
        return model;
    } catch (error) {
        console.error('Error loading model:', error);
        throw error;
    }
}

module.exports = {
    loadModel
};
