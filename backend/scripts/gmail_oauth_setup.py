"""One-time local helper: get a Gmail API refresh token for kontakt@zebick.com.

Run from backend/:  python -m scripts.gmail_oauth_setup
Prompts for the Client ID + Secret from Google Cloud Console, opens a
browser for you to approve access, then prints the refresh token. Nothing
is written to disk — copy the printed value into Render as GMAIL_REFRESH_TOKEN.

See docs/email-gmail-api-setup.md for the full walkthrough (creating the
Google Cloud project, OAuth consent screen, Client ID).
"""
import getpass
import urllib.parse
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer

import httpx

REDIRECT_PORT = 8765
REDIRECT_URI = f"http://localhost:{REDIRECT_PORT}/"
SCOPE = "https://www.googleapis.com/auth/gmail.send"


def main() -> None:
    client_id = input("Google OAuth Client ID: ").strip()
    client_secret = getpass.getpass("Google OAuth Client Secret (hidden): ").strip()

    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode({
        "client_id": client_id,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPE,
        "access_type": "offline",
        "prompt": "consent",  # force a refresh_token even on repeat runs
    })

    received_code = {}

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):  # noqa: N802
            params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            received_code["code"] = params.get("code", [None])[0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write("<p>Fertig, du kannst dieses Fenster schliessen.</p>".encode())

        def log_message(self, *args):  # silence default request logging
            pass

    print("\nOeffne deinen Browser fuer die Google-Anmeldung ...")
    print("Falls er sich nicht automatisch oeffnet, diesen Link manuell aufrufen:")
    print(auth_url, "\n")
    webbrowser.open(auth_url)

    server = HTTPServer(("localhost", REDIRECT_PORT), Handler)
    print(f"Warte auf Antwort von Google (http://localhost:{REDIRECT_PORT}) ...")
    while "code" not in received_code:
        server.handle_request()

    code = received_code["code"]
    if not code:
        raise SystemExit("Kein Code erhalten — Zugriff vermutlich abgelehnt.")

    resp = httpx.post("https://oauth2.googleapis.com/token", data={
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI,
    })
    resp.raise_for_status()
    tokens = resp.json()
    refresh_token = tokens.get("refresh_token")
    if not refresh_token:
        raise SystemExit(
            "Kein refresh_token erhalten. Meist weil schon einmal autorisiert wurde "
            "ohne 'prompt=consent' — bei Google unter myaccount.google.com/permissions "
            "den Zugriff fuer diese App entfernen und das Skript erneut ausfuehren."
        )

    print("\nErfolgreich! Diese drei Werte bei Render eintragen:\n")
    print("GMAIL_CLIENT_ID=" + client_id)
    print("GMAIL_CLIENT_SECRET=" + client_secret)
    print("GMAIL_REFRESH_TOKEN=" + refresh_token)


if __name__ == "__main__":
    main()
