#!/bin/bash
cd "$(dirname "$0")"
../../venv_backend/bin/python manage.py runserver 0.0.0.0:19006
