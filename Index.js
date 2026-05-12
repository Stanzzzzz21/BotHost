require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.REDIRECT_URI,
    scope: ["identify"]
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

app.get("/login", passport.authenticate("discord"));

app.get("/callback",
    passport.authenticate("discord", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/dashboard");
    }
);

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

app.get("/dashboard", checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "Dashboard.html"));
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "Index.html"));
});

app.listen(3000, () => console.log("Backend running"));
