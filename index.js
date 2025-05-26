// server/index.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://mood-mixtape-ex99.vercel.app/callback";

app.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email playlist-read-private";
  res.redirect(
    "https://accounts.spotify.com/authorize" +
      "?response_type=code" +
      `&client_id=${CLIENT_ID}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
  );
});

app.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  const authOptions = {
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: new URLSearchParams({
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }).toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
    },
  };

  try {
    const response = await axios(authOptions);
    const { access_token, refresh_token } = response.data;
    // Redirect back to frontend with tokens in URL
    res.redirect(
      `https://mood-mixtape-ex99.vercel.app/#access_token=${access_token}&refresh_token=${refresh_token}`
    );
  } catch (error) {
    res.send("Error getting tokens: " + error.message);
  }
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
