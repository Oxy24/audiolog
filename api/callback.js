import fetch from 'node-fetch';

export default async function handler(req, res) {
  const code = req.query.code;
  const client_id = "87ae440dcbbb40699c7b76dbda41a9da";
  const client_secret = process.env.CLIENT_SECRET;
  const redirect_uri = "https://audiolog-one.vercel.app/api/callback";

  const body = new URLSearchParams();
  body.append('grant_type', 'authorization_code');
  body.append('code', code);
  body.append('redirect_uri', redirect_uri);

  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: body,
    headers: { 'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64') }
  });

  const data = await tokenResponse.json();

  if (data.access_token) {
    res.redirect(`https://oxy24.github.io/audiolog/#access_token=${data.access_token}`);
  } else {
    res.send('Errore: token non trovato!');
  }
}
