import crypto from "crypto";

export default function handler(req,res){
  const client_id = "87ae440dcbbb40699c7b76dbda41a9da";
  const redirect_uri = "https://audiolog-one.vercel.app/callback.html";
  const scope = "user-read-currently-playing user-read-recently-played user-top-read";

  // PKCE code_verifier e code_challenge
  const code_verifier = crypto.randomBytes(64).toString('hex');
  const code_challenge = crypto.createHash('sha256').update(code_verifier).digest('base64url');

  res.setHeader('Set-Cookie', `code_verifier=${code_verifier}; Path=/; Secure; HttpOnly`);
  const auth_url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirect_uri)}&code_challenge_method=S256&code_challenge=${code_challenge}`;

  res.writeHead(302,{Location: auth_url});
  res.end();
}
