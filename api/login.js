export default function handler(req, res) {
  const client_id = "87ae440dcbbb40699c7b76dbda41a9da";
  const redirect_uri = "https://audiolog-one.vercel.app/api/callback";
  const scope = "user-read-recently-played";
  const state = Math.random().toString(36).substring(2, 15);

  const auth_url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${encodeURIComponent(
    scope
  )}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}`;

  res.writeHead(302, { Location: auth_url });
  res.end();
}
