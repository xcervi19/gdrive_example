import { google } from "googleapis";

export async function GET(request) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `http://${request.headers.host}/api/oauth2callback` // Ensure this matches the redirect URI in Google Cloud Console
  );

  const url = new URL(request.url, `http://${request.headers.host}`);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response(
      JSON.stringify({ message: "ok", error: "Missing authorization code" }),
      { status: 200 }
    );
    // return res.status(400).json({ error: 'Missing authorization code' });
  }

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  // Optionally, store the tokens securely for future use

  // Now that we have access, perform a test operation like listing files
  const drive = google.drive({ version: "v3", auth: oAuth2Client });
  const driveResponse = await drive.files.list({
    pageSize: 10,
    fields: "nextPageToken, files(id, name)",
  });

  // Respond with the list of files
  return new Response(JSON.stringify(driveResponse.data.files), {
    status: 200,
  });
}
