FROM python:3.12-slim

WORKDIR /app

# ca-certificates: the base image's bundle is frequently stale, which makes
# the TLS handshake to MongoDB Atlas fail with "SSL: TLSV1_ALERT_INTERNAL_ERROR"
# (seen in production — not hypothetical). update-ca-certificates refreshes it
# from Debian's current root store.
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && update-ca-certificates && rm -rf /var/lib/apt/lists/*

# System deps are usually unnecessary (bcrypt/cryptography/pillow ship
# manylinux wheels), but build tools are a safe fallback if a wheel is
# missing for your platform — uncomment if `pip install` fails below.
# RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Real values come from the environment at `docker run`/compose time (see
# .env.example) — never bake secrets into the image.
EXPOSE 8001
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
