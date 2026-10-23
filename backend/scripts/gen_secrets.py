"""Generate fresh production secrets (JWT secret + admin password hash).

Run from backend/:   python -m scripts.gen_secrets
The values are only printed to your terminal. Nothing is written to disk.
Put them into your host's environment variables, never into git.
"""
import getpass
import secrets

import bcrypt


def main() -> None:
    print("JWT_SECRET=" + secrets.token_urlsafe(64))
    pw = getpass.getpass("New admin password (hidden, at least 12 characters): ")
    if len(pw) < 12:
        raise SystemExit("Password too short (minimum 12 characters).")
    hashed = bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode()
    print("ADMIN_PASSWORD_HASH=" + hashed)
    print("\nNote: the hash contains '$' characters. Wrap it in single quotes in a "
          "shell or .env file, or paste it into your host's variable form as-is.")


if __name__ == "__main__":
    main()
