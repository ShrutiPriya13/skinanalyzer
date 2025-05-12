require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const cors = require("cors");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./User"); // Moved inside models folder if applicable

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5500;
const path = require('path');

// Configure session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
},
(accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Google auth routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/model');
    });

// Initialize model and recommendations
let modelLoaded = false;
let recommendations = null;

// Load model and recommendations
function initializeSystem() {
    return new Promise((resolve, reject) => {
        // Start Python recommendation system
        const pythonProcess = spawn('python', ['recommendations/recommend.py']);
        
        pythonProcess.stdout.on('data', (data) => {
            console.log(`Python output: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                console.log('Recommendation system initialized successfully');
                modelLoaded = true;
                resolve();
            } else {
                console.error('Failed to initialize recommendation system');
                reject(new Error('Failed to initialize recommendation system'));
            }
        });
    });
}

// Initialize the system when server starts
initializeSystem().catch(error => {
    console.error('Error initializing system:', error);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Set up routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/model', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'model.html'));
});

// File upload middleware
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
};
app.use(cors(corsOptions));

// Serve static files (HTML, CSS, images)
app.use(express.static(path.join(__dirname, "public")));

app.use(express.static("public"));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log("MongoDB connection error:", err));

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
        user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            profilePic: profile.photos[0].value
        });
        await user.save();
    }
    return done(null, user);
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

// OAuth Routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login.html" }),
    (req, res) => res.redirect("/model.html")
);

// Logout Route
app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.session.destroy();
        res.clearCookie('connect.sid');
        // ✅ Redirect to login or home page after logout
        res.redirect('/login.html');
    });
});

// Check User Status
app.get("/user", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ loggedIn: true, user: { name: req.user } });
    } else {
        res.json({ loggedIn: false });
    }
});

const predict = require("./predict");
const recommend = require("./recommend");

// Authentication check
app.get('/auth/check', (req, res) => {
    res.json({ isAuthenticated: req.isAuthenticated(), user: req.user });
});

// API Routes
app.post("/api/predict", upload.single('file'), async (req, res) => {
    try {
        if (!modelLoaded) {
            return res.status(503).json({ error: 'System not ready. Please try again later.' });
        }
        
        const prediction = await predict.predictImage(req, res);
        res.json(prediction);
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

app.post("/api/predict_questionnaire", async (req, res) => {
    try {
        if (!modelLoaded) {
            return res.status(503).json({ error: 'System not ready. Please try again later.' });
        }
        
        const prediction = await predict.predictQuestionnaire(req, res);
        res.json(prediction);
    } catch (error) {
        console.error('Questionnaire error:', error);
        res.status(500).json({ error: 'Failed to process questionnaire' });
    }
});

app.get("/api/recommend/:skinType", async (req, res) => {
    try {
        if (!modelLoaded) {
            return res.status(503).json({ error: 'System not ready. Please try again later.' });
        }
        
        const skinType = req.params.skinType;
        // Call Python script for recommendations
        const pythonProcess = spawn('python', ['recommendations/recommend.py', skinType]);
        
        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const recommendations = JSON.parse(output);
                    res.json({
                        skin_type: skinType,
                        recommended_products: recommendations
                    });
                } catch (e) {
                    console.error('Failed to parse recommendations:', e);
                    res.status(500).json({ error: 'Failed to fetch recommendations' });
                }
            } else {
                res.status(500).json({ error: 'Failed to fetch recommendations' });
            }
        });
    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

// Handle errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
app.post("/api/predict_questionnaire", predict.predictQuestionnaire);
app.get("/api/recommend/:skinType", recommend.getRecommendations);

// Start Server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
