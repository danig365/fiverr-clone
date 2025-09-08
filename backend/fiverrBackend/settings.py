from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

# BASE_DIR
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file
load_dotenv(os.path.join(BASE_DIR, ".env"))

# SECURITY
SECRET_KEY = os.getenv(
    "SECRET_KEY", "django-insecure-yc1slvdn8+ej_mis-&-+8d%l1-^elw5@u50k+olc$+y#z!pqhg"
)
DEBUG = os.getenv("DEBUG", "True") == "True"
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")

STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_ENDPOINT_SECRET = os.getenv("STRIPE_ENDPOINT_SECRET", "")  # webhook signing secret

# CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]

# JWT Settings
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        seconds=int(os.getenv("ACCESS_TOKEN_LIFETIME", 300))
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        seconds=int(os.getenv("REFRESH_TOKEN_LIFETIME", 86400))
    ),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
}

# Installed Apps
INSTALLED_APPS = [
    "rest_framework",
    "corsheaders",
    "rest_framework_simplejwt.token_blacklist",
    "users",
    'gigs',
    'chat',
    'orders',
    'payments',
    'reviews',
    'notifications',
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

# Middleware
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "fiverrBackend.urls"

# Templates
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "fiverrBackend.wsgi.application"

# Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Password Validators
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    )
}

# Static & Media
STATIC_URL = "static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "users.User"

# Email
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("SMTP_PORT", 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("SMTP_USER")
EMAIL_HOST_PASSWORD = os.getenv("SMTP_PASS")
DEFAULT_FROM_EMAIL = os.getenv("EMAIL_FROM", EMAIL_HOST_USER)

# Logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "DEBUG"},
}


# Basic throttling settings to limit abuse (adjust rates as needed)
REST_FRAMEWORK.setdefault("DEFAULT_THROTTLE_CLASSES", [])
REST_FRAMEWORK.setdefault("DEFAULT_THROTTLE_RATES", {})
# Add a messages scope used by chat send_message action
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"].setdefault("messages", "30/min")
# Keep basic anon/user throttles (safe defaults)
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle  # noqa: E402
if "rest_framework.throttling.AnonRateThrottle" not in REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"]:
    REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"].extend(
        [
            "rest_framework.throttling.AnonRateThrottle",
            "rest_framework.throttling.UserRateThrottle",
        ]
    )
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"].setdefault("anon", "60/min")
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"].setdefault("user", "200/min")