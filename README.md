# Notes App

A simple Django-based notes application for creating, editing, archiving, and managing notes.

## Features

- User authentication with signup/login/logout
- Create, edit, and delete notes
- Mark notes as important or archived
- Filter and manage personal notes by owner
- Responsive frontend using Django templates and custom CSS/JS

## Tech Stack

- Python
- Django
- SQLite
- HTML, CSS, JavaScript

## Project Structure

- `core/` - Django project configuration
- `note/` - notes app logic, models, views, templates, and static files
- `manage.py` - Django management script
- `db.sqlite3` - local SQLite database

## Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Apply migrations:
   ```bash
   python manage.py migrate
   ```

4. Run the development server:
   ```bash
   python manage.py runserver
   ```

5. Open the app in your browser:
   ```text
   http://127.0.0.1:8000/
   ```

## Default Admin

To manage the app via Django admin, create a superuser:

```bash
python manage.py createsuperuser
```

## Notes

This project is intended as a lightweight personal notes app and can be extended with features such as:

- categories/folders
- search and filtering
- reminder support
- dark mode
- API endpoints
