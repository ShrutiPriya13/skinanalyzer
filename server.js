require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const cors = require("cors");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./User"); // Moved inside models folder if applicable

const app = express();
const PORT = process.env.PORT || 5500;

app.use(express.json());
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

// Start Server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
