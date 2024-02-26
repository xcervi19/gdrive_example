const { google } = require('googleapis');

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth2callback' // Update with your redirect URI
);

export async function GET(request) {
  // Check if we have an authorization code in the query parameters
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (code) {
    try {
      // Exchange code for tokens
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      // Access Google Drive and fetch a file
      const drive = google.drive({ version: 'v3', auth: oAuth2Client });
      const response = await drive.files.list({
        pageSize: 1,
        fields: 'files(id, name)',
        q: "mimeType='image/jpeg'"
      });

      const files = response.data.files;
      if (files.length === 0) {
        return new Response(JSON.stringify({ message: "No images found" }), { status: 404 });
      } else {
        return new Response(JSON.stringify(files[0]), { status: 200 });
      }
    } catch (error) {
      return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
  } else {
    // Generate the auth URL if no code is present
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    return new Response(JSON.stringify({authUrl: authUrl}))
    // return Response.redirect(authUrl, 302);
  }
}
