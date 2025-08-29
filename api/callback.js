import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const code = req.query.code;
    const client_id = "87ae440dcbbb40699c7b76dbda41a9da";
    const client_secret = process.env.CLIENT_SECRET;
    const redirect_uri = "https://audiolog-one.vercel.app/api/callback";

    if (!client_secret) {
      res.status(500).send("Errore: CLIENT_SECRET non impostato");
      return;
    }

    const body = new URLSearchParams();
    body.append("grant_type", "authorization_code");
    body.append("code", code);
    body.append("redirect_uri", redirect_uri);

    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: body,
      headers: {
        Authorization: "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    const data = await tokenResponse.json();

    if (data.access_token) {
      res.writeHead(302, {
        Location: `https://oxy24.github.io/audiolog/#access_token=${data.access_token}`
      });
      res.end();
    } else {
      res.status(500).send("Errore: token non trovato!");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore interno del server");
  }
}
