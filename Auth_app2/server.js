import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import sequelize from "./sequelize.js";
import User from "./models/User.js";
import SequelizeStoreInit from "connect-session-sequelize";
import expressLayouts from "express-ejs-layouts"; // ✅ Layouts support added

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Views
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(expressLayouts); // ✅ Enable layout support
app.set("layout", "base"); // ✅ Set default layout (views/base.ejs)

app.use(express.urlencoded({ extended: true }));

// Session store
const SequelizeStore = SequelizeStoreInit(session.Store);
const sessionStore = new SequelizeStore({ db: sequelize });

app.use(session({
  secret: process.env.SECRET_KEY,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
}));
sessionStore.sync();

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id);
  done(null, user);
});

// Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { google_id: profile.id } });
    if (!user && profile.emails?.length) {
      user = await User.findOne({ where: { email: profile.emails[0].value } });
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
    let user = await User.findOne({ where: { spotify_id: profile.id } });
    if (!user && profile.emails?.length) {
      user = await User.findOne({ where: { email: profile.emails[0].value } });
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
const HOST = '127.0.0.1';
sequelize.sync().then(() => {
  app.listen(PORT, HOST, () => console.log(`🚀 Server running at http://${HOST}:${PORT}`));
});
