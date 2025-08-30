import fetch from "node-fetch";

export default async function handler(req,res){
  try{
    const code = req.query.code;
    const client_id = "87ae440dcbbb40699c7b76dbda41a9da";
    const redirect_uri = "https://audiolog-one.vercel.app/callback.html";
    const code_verifier = req.cookies.code_verifier;

    if(!code_verifier){
      res.status(500).send("Errore PKCE mancante");
      return;
    }

    const body = new URLSearchParams();
    body.append("grant_type","authorization_code");
    body.append("code",code);
    body.append("redirect_uri",redirect_uri);
    body.append("client_id",client_id);
    body.append("code_verifier",code_verifier);

    const tokenRes = await fetch("https://accounts.spotify.com/api/token",{method:"POST",body,headers:{"Content-Type":"application/x-www-form-urlencoded"}});
    const data = await tokenRes.json();

    if(data.access_token){
      res.writeHead(302,{Location:`/index.html#access_token=${data.access_token}`});
      res.end();
    }else{
      res.status(500).send("Errore: token non ottenuto");
    }
  }catch(err){
    console.error(err);
    res.status(500).send("Errore interno del server");
  }
}
