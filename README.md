# Skin Type Detection and Recommendation Web App

## Description
Skin Type Detection and Recommendation is an AI-powered web app designed to help users determine their skin type and receive personalized skincare recommendations. The app offers two methods for skin type analysis:

1. Image Analysis: Users can upload their facial images, and the app will use machine learning models to classify their skin type.

2. Questionnaire: For those who prefer not to upload images, the app provides a series of questions to determine their skin type based on responses.

Once the skin type is detected, the app offers customized skincare tips and product recommendations to help users take better care of their skin.

## Features
- Skin Type Detection using AI and image analysis.

- Questionnaire-based Skin Type Classification for users who prefer not to upload images.

- Personalized Skincare Recommendations based on the detected skin type.

- User-friendly Web Interface for easy navigation and interaction.

## Technologies Used
- Frontend: HTML, CSS, JavaScript, React
- Backend: Node.js, Express
- Machine Learning: Python, TensorFlow, Keras (for skin type detection)
- Database: MongoDB (for storing user preferences and recommendations)
- Deployment: vercel

## Getting started

### Environment configuration
Create a .env file in the root directory and add necessary variables like DATABASE_URL, PORT, and SECRET_KEY.

### Installation
1. Clone the Repository
```bash
git clone https://github.com/your-username/skin-type-detection-and-recommendation.git
cd skin-type-detection-and-recommendation
```

2. Set Up the Backend
- Navigate to the backend folder:
```bash
cd backend
```

- Install the dependencies:
```bash
npm install
```

- Start the server:
```bash
npm start
```

3. Set Up the Frontend
- Navigate to the frontend folder:
```bash
cd frontend
```

- Install the dependencies:
```bash
npm install
```

- Start the frontend:
```bash
npm start
```

## Usage
1. Image Upload Method: Users can upload a clear facial image for analysis. The AI model will classify the skin type and display results.
2. Questionnaire Method: Users can answer a set of questions about their skin's characteristics. Based on their responses, the app will classify the skin type.
3. Recommendations: After determining the skin type, the app provides a set of skincare recommendations tailored to the user.

## Contributing
If you would like to contribute to this project, follow these steps:
1. Fork the repository.
2. Create a new branch (git checkout -b feature-branch).
3. Make your changes.
4. Commit your changes (git commit -am 'Add new feature').

5. Push to the branch (git push origin feature-branch).

6. Create a pull request.

## Deployment Instructions

### Deploying to Render

1. Create a new web service on Render:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" and select "Web Service"
   - Choose "GitHub" as your repository source
   - Connect your GitHub repository
   - Select the branch you want to deploy (usually `main` or `master`)

2. Configure Build Settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`

3. Set Environment Variables:
   - `MODEL_URL`: Your Google Drive model URL
   - `MONGO_URI`: Your MongoDB connection string
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
   - `SESSION_SECRET`: Your session secret
   - `FRONTEND_URL`: URL of your frontend application
   - `GOOGLE_CALLBACK_URL`: Your callback URL for Google OAuth

4. Wait for deployment to complete. Once deployed, you'll get a URL like `https://your-app.onrender.com`

5. Update Google OAuth settings:
   - Go to Google Cloud Console
   - Find your OAuth 2.0 Client ID
   - Add the callback URL: `https://your-app.onrender.com/auth/google/callback`

## License
This project is licensed under the MIT License - see the LICENSE file for details
[MIT](LICENSE)
