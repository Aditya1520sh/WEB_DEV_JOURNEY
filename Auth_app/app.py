import os
from datetime import datetime, timezone
from functools import wraps
from flask import Flask, redirect, url_for, session, render_template, flash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
from contextlib import contextmanager

# -------------------------------
# Load environment variables
# -------------------------------
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "supersecretkey")

# -------------------------------
# Database setup (MySQL)
# -------------------------------
DB_URL = os.getenv("DATABASE_URI")  # ✅ Load MySQL URI from .env
app.config["SQLALCHEMY_DATABASE_URI"] = DB_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
engine = create_engine(DB_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# -------------------------------
# Database Models
# -------------------------------
class User(db.Model):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    google_id = Column(String(255), unique=True, nullable=True)   # ✅ google id
    spotify_id = Column(String(255), unique=True, nullable=True)  # ✅ spotify id
    name = Column(String(255))
    email = Column(String(255), unique=True, nullable=True)       # ✅ unique email
    picture = Column(String(500))
    locale = Column(String(50))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = Column(DateTime, default=lambda: datetime.now(timezone.utc))

with app.app_context():
    db.create_all()

@contextmanager
def get_db_session():
    db_session = SessionLocal()
    try:
        yield db_session
        db_session.commit()
    except Exception:
        db_session.rollback()
        raise
    finally:
        db_session.close()

# -------------------------------
# OAuth setup (Google + Spotify)
# -------------------------------
oauth = OAuth(app)

# Google OAuth
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    authorize_params=None,
    access_token_url="https://oauth2.googleapis.com/token",
    access_token_params=None,
    refresh_token_url=None,
    client_kwargs={"scope": "openid email profile"},
    api_base_url="https://www.googleapis.com/oauth2/v1/",
    userinfo_endpoint="https://openidconnect.googleapis.com/v1/userinfo",
    jwks_uri="https://www.googleapis.com/oauth2/v3/certs",
)

# Spotify OAuth
oauth.register(
    name="spotify",
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
    authorize_url="https://accounts.spotify.com/authorize",
    access_token_url="https://accounts.spotify.com/api/token",
    api_base_url="https://api.spotify.com/v1/",
    client_kwargs={"scope": "user-read-email user-read-private"},
)

# -------------------------------
# Helpers
# -------------------------------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function

# -------------------------------
# Routes
# -------------------------------
@app.route("/")
def index():
    return render_template("login.html")

# ---------------- Google Login ----------------
@app.route("/login")
def login():
    redirect_uri = url_for("auth_callback", _external=True)
    return oauth.google.authorize_redirect(redirect_uri)

@app.route("/auth/callback")
def auth_callback():
    token = oauth.google.authorize_access_token()
    if not token:
        flash("Failed to authorize.", "danger")
        return redirect(url_for("index"))

    user_info = oauth.google.get("userinfo").json()
    google_id = user_info.get("id")
    name = user_info.get("name")
    email = user_info.get("email")
    picture = user_info.get("picture")
    locale = user_info.get("locale")
    now = datetime.now(timezone.utc)

    try:
        with get_db_session() as dbs:
            # Step 1: Find by google_id
            user = dbs.query(User).filter(User.google_id == google_id).first()

            # Step 2: Agar google_id nahi mila toh email check kar
            if not user and email:
                user = dbs.query(User).filter(User.email == email).first()

            if user:
                # Existing user update
                user.google_id = google_id
                user.name = name or user.name
                user.email = email or user.email
                user.picture = picture or user.picture
                user.locale = locale or user.locale
                user.last_login = now
            else:
                # New user create
                user = User(
                    google_id=google_id,
                    name=name,
                    email=email,
                    picture=picture,
                    locale=locale,
                    created_at=now,
                    last_login=now
                )
                dbs.add(user)

            dbs.flush()
            session["user_id"] = user.id
    except Exception as e:
        import traceback
        traceback.print_exc()
        app.logger.error(f"DB Error: {e}")
        flash("Internal error saving user.", "danger")
        return redirect(url_for("index"))

    return redirect(url_for("profile"))

# ---------------- Spotify Login ----------------
@app.route("/spotify/login")
def spotify_login():
    redirect_uri = url_for("spotify_callback", _external=True)
    return oauth.spotify.authorize_redirect(redirect_uri)

@app.route("/spotify/callback")
def spotify_callback():
    token = oauth.spotify.authorize_access_token()
    if not token:
        flash("Spotify authorization failed.", "danger")
        return redirect(url_for("index"))

    user_info = oauth.spotify.get("me").json()
    spotify_id = user_info.get("id")
    name = user_info.get("display_name")
    email = user_info.get("email")
    picture = None
    if user_info.get("images") and len(user_info["images"]) > 0:
        picture = user_info["images"][0]["url"]

    now = datetime.now(timezone.utc)

    try:
        with get_db_session() as dbs:
            # Step 1: Find by spotify_id
            user = dbs.query(User).filter(User.spotify_id == spotify_id).first()

            # Step 2: Agar spotify_id nahi mila toh email check kar
            if not user and email:
                user = dbs.query(User).filter(User.email == email).first()

            if user:
                # Existing user update
                user.spotify_id = spotify_id
                user.name = name or user.name
                user.email = email or user.email
                user.picture = picture or user.picture
                user.last_login = now
            else:
                # New user create
                user = User(
                    spotify_id=spotify_id,
                    name=name,
                    email=email,
                    picture=picture,
                    created_at=now,
                    last_login=now
                )
                dbs.add(user)

            dbs.flush()
            session["user_id"] = user.id
    except Exception as e:
        import traceback
        traceback.print_exc()
        app.logger.error(f"DB Error: {e}")
        flash("Internal error saving Spotify user.", "danger")
        return redirect(url_for("index"))

    return redirect(url_for("profile"))

# ---------------- Profile / Logout ----------------
@app.route("/profile")
@login_required
def profile():
    uid = session.get("user_id")
    user = User.query.filter_by(id=uid).first()
    if not user:
        session.clear()
        return redirect(url_for("index"))
    return render_template("profile.html", user=user)

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))

# -------------------------------
# Main
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True)
