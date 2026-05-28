FROM python:3.12-slim
# Set the working directory to /app
WORKDIR /app
# Copy locked runtime dependencies to the container
COPY requirements.lock /app/
# Install verified Python packages
RUN pip install --no-cache-dir --require-hashes --only-binary=:all: -r requirements.lock
# Copy the entire project
COPY . .
# Expose port 8000 to communicate with the host
EXPOSE 8000
# Command to run the Django server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
