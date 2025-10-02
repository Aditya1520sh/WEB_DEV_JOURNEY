import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import mongoose from "./sequelize.js"; // renamed file still works, contains mongoose connection
import User from "./models/User.js";
import MongoStore from "connect-mongo";
import expressLayouts from "express-ejs-layouts";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Views
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(expressLayouts);
app.set("layout", "base");

app.use(express.urlencoded({ extended: true }));

// Session store using MongoDB
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DB_URI,
    collectionName: "sessions",
  }),
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ google_id: profile.id });
    if (!user && profile.emails?.length) {
      user = await User.findOne({ email: profile.emails[0].value });
    }

    if (user) {
      user.google_id = profile.id;
      user.name = profile.displayName || user.name;
      user.email = profile.emails?.[0]?.value || user.email;
      user.picture = profile.photos?.[0]?.value || user.picture;
      user.locale = profile._json.locale || user.locale;
      user.last_login = new Date();
      await user.save();
    } else {
      user = await User.create({
        google_id: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        picture: profile.photos?.[0]?.value,
        locale: profile._json.locale,
        created_at: new Date(),
        last_login: new Date(),
      });
    }

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// Spotify OAuth
passport.use(new SpotifyStrategy({
  clientID: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  callbackURL: process.env.SPOTIFY_REDIRECT_URI,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ spotify_id: profile.id });
    if (!user && profile.emails?.length) {
      user = await User.findOne({ email: profile.emails[0].value });
    }

    if (user) {
      user.spotify_id = profile.id;
      user.name = profile.displayName || user.name;
      user.email = profile.emails?.[0]?.value || user.email;
      user.picture = profile.photos?.[0]?.url || user.picture;
      user.last_login = new Date();
      await user.save();
    } else {
      user = await User.create({
        spotify_id: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        picture: profile.photos?.[0]?.url,
        created_at: new Date(),
        last_login: new Date(),
      });
    }

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// Routes
app.get("/", (req, res) => res.render("login"));
app.get("/login", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => res.redirect("/profile"));

app.get("/spotify/login", passport.authenticate("spotify", { scope: ["user-read-email", "user-read-private"] }));
app.get("/spotify/callback", passport.authenticate("spotify", { failureRedirect: "/" }), (req, res) => res.redirect("/profile"));

app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");
  res.render("profile", { user: req.user });
});

app.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

// Start server
export default app; 

