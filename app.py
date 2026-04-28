from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
import random
import string
import os

env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                k, v = line.strip().split('=', 1)
                os.environ[k.strip()] = v.strip()

app = Flask(__name__)

#
# Configuration (safe for public repos)
#
# - FLASK_SECRET_KEY: required for sessions/flash
# - DATABASE_URL: optional; defaults to local sqlite under ./instance/
# - MAIL_*: optional; only needed for password reset emails
#
app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY", "dev-only-change-me")

# Ensure instance folder exists for sqlite db
os.makedirs(app.instance_path, exist_ok=True)

default_db_path = os.path.join(app.instance_path, "visualization.db")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL",
    f"sqlite:///{default_db_path}",
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Pass db instance to sortmentor module BEFORE importing models
import sortmentor
sortmentor.db = db

# Initialize models after db is set
sortmentor.init_models()

# Now import the blueprint and models (they are already set)
from sortmentor import sortmentor_bp, SortRun, PolicyWeights

# Mail configuration (optional)
app.config["MAIL_SERVER"] = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
app.config["MAIL_PORT"] = int(os.environ.get("MAIL_PORT", "587"))
app.config["MAIL_USE_TLS"] = os.environ.get("MAIL_USE_TLS", "true").lower() in ("1", "true", "yes", "on")
app.config["MAIL_USERNAME"] = os.environ.get("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.environ.get("MAIL_PASSWORD")

mail = Mail(app)


class register_db(db.Model):
    sno = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    email = db.Column(db.String(20), nullable=False, unique=True)
    # Password hashes are long (e.g. scrypt/pbkdf2), so keep ample space.
    password = db.Column(db.String(256), nullable=False)

# Register SortMentor blueprint
app.register_blueprint(sortmentor_bp, url_prefix='/api/sortmentor')

with app.app_context():
    db.create_all()


@app.route('/')
def Home():
    # Check if the user is logged in (if session doesn't have 'user_id', redirect to login)
    if 'user_id' not in session:
        return redirect(url_for('login'))

    return redirect(url_for('sortmentor_page'))


# forgot 
@app.route('/forgot', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form['email']
        user = register_db.query.filter_by(email=email).first()

        if user:
            new_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
            user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
            db.session.commit()
            success, error_msg = send_reset_email(email, new_password)
            if success:
                flash("A new password has been sent to your email.", "success")
            else:
                flash(f"Email could not be sent ({error_msg}). Your temporary password is: {new_password} (Please copy it now)", "warning")
            return redirect(url_for('login'))
        else:
            flash("No account found with that email.", "danger")
    return render_template("forgot.html")

def send_reset_email(email: str, new_password: str) -> tuple:
    """
    Send a password reset email if MAIL_USERNAME / MAIL_PASSWORD are configured.
    Returns (True, "") if sent, (False, error_message) otherwise.
    """
    if not app.config.get("MAIL_USERNAME") or not app.config.get("MAIL_PASSWORD"):
        return False, "Missing MAIL_USERNAME or MAIL_PASSWORD in .env"
    try:
        msg = Message(
            "Your password reset",
            sender=app.config["MAIL_USERNAME"],
            recipients=[email],
        )
        msg.body = f"Your new temporary password is: {new_password}\n\nPlease log in and change it."
        mail.send(msg)
        return True, ""
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False, str(e)




@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Extract form data
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']

        # Create a new user and add to the database
        new_user = register_db(
            username=username,
            email=email,
            password=generate_password_hash(password, method='pbkdf2:sha256'),
        )
        db.session.add(new_user)
        
        try:
            db.session.commit()
            print("Data saved to database")
            # Auto-login the user after registration
            session['user_id'] = new_user.sno
            flash("Registration successful! Welcome to Algosee.", "success")
            return redirect(url_for('sortmentor_page'))
        except Exception as e:
            db.session.rollback()
            print("Error saving data:", e)
            flash("Registration failed. Email or username might already exist.", "danger")
            return redirect(url_for('register'))

    return render_template("register.html")

@app.route('/login', methods=['GET', 'POST'])
def login():
    # Check if the user is already logged in
    if 'user_id' in session:
        return redirect(url_for('sortmentor_page'))

    if request.method == 'POST':
        # Retrieve form data
        email = request.form.get('email')
        password = request.form.get('password')

        # Query the database for the user
        user = register_db.query.filter_by(email=email).first()

        if user:
            # Backwards-compatible: support old plaintext passwords too.
            stored = user.password or ""
            ok = False
            try:
                ok = check_password_hash(stored, password)
            except Exception:
                ok = False
            if not ok and stored == password:
                ok = True

            if ok:
                session['user_id'] = user.sno  # Store user ID in session
                flash(f"Welcome back, {user.username}!", "success")
                return redirect(url_for('sortmentor_page'))  # Redirect after successful login

        # If credentials are incorrect
        flash("Invalid email or password. Please try again.", "danger")

    # Render login page if GET request or if credentials are invalid
    return render_template("login.html")


@app.route('/logout')
def logout():
    # Remove the 'user_id' from the session to log the user out
    session.pop('user_id', None)

    # Flash a message indicating that the user has been logged out
    flash("You've been logged out.", "info")

    return redirect(url_for('login'))




@app.route('/newPassword')
def newPassword():
    return render_template('newPassword.html')


@app.route('/sortmentor')
def sortmentor_page():
    if 'user_id' not in session:
        flash("You must be logged in to access Algosee.", "warning")
        return redirect(url_for('login'))
        
    user = register_db.query.get(session['user_id'])
    return render_template('sortmentor.html', user=user)


if __name__ == "__main__":
    app.run(debug=True, port=8000)