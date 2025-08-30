export default function handler(req,res){
  const client_id = "87ae440dcbbb40699c7b76dbda41a9da";
  const redirect_uri = "https://audiolog-one.vercel.app/callback.html";
  const scope = "user-read-currently-playing user-read-recently-played user-top-read";

  const auth_url = `https://accounts.spotify.com/authorize?response_type=token&client_id=${client_id}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirect_uri)}`;

  res.writeHead(302,{Location: auth_url});
  res.end();
}
