from google_auth_oauthlib.flow import InstalledAppFlow
import os
import json
from google.oauth2.credentials import Credentials

# Define the scopes we need
SCOPES = [
    'https://www.googleapis.com/auth/drive.file',  # For uploading files
    'https://www.googleapis.com/auth/drive.readonly'  # For reading files
]

def get_refresh_token():
    # Load existing credentials if available
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        if creds.refresh_token:
            print(f"Refresh token already exists: {creds.refresh_token}")
            return creds.refresh_token

    # If no valid credentials available, let user log in
    flow = InstalledAppFlow.from_client_secrets_file(
        'credentials.json',  # This will be created next
        SCOPES
    )

    # Run the flow
    creds = flow.run_local_server(port=0)

    # Save the credentials for the next run
    with open('token.json', 'w') as token:
        token.write(creds.to_json())

    print(f"\n✅ Successfully obtained refresh token!")
    print(f"Refresh token: {creds.refresh_token}")
    print("\nAdd this refresh token to your .env file as GOOGLE_DRIVE_REFRESH_TOKEN")
    return creds.refresh_token

if __name__ == '__main__':
    # First, create a credentials.json file with your existing client ID and secret
    credentials = {
        "installed": {
            "client_id": os.getenv('GOOGLE_CLIENT_ID'),
            "project_id": "skin-analyzer",  # Your project ID
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": os.getenv('GOOGLE_CLIENT_SECRET'),
            "redirect_uris": ["http://localhost"]
        }
    }

    # Save credentials to file
    with open('credentials.json', 'w') as f:
        json.dump(credentials, f)

    # Get the refresh token
    get_refresh_token()
