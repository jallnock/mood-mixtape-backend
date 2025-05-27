const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const FRONTEND_URI = process.env.FRONTEND_URI;

app.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email playlist-read-private";
  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      scope,
      redirect_uri: REDIRECT_URI,
    });

  res.redirect(authUrl);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;

  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64"
  );

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const data = await response.json();

  if (data.access_token) {
    const access_token = data.access_token;
    // ✅ Redirect to frontend with token in the hash (so React can read it)
    res.redirect(`${FRONTEND_URI}/callback#access_token=${access_token}`);
  } else {
    console.error("Failed to get access token:", data);
    res.send("Failed to log in. Check backend logs.");
  }
});

app.listen(8888, () => {
  console.log("Backend running on http://localhost:8888");
});
