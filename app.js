const express = require("express");
const {OAuth2Client} = require("google-auth-library");
const path = require("path");

const app = express();
const client = new OAuth2Client("YOUR_CLIENT_ID", "YOUR_CLIENT_SECRET", "YOUR_REDIRECT_URI");

// Serve static files (optional)
app.use(express.static(path.join(__dirname, "public")));

// Redirect to Google authentication
app.get("/login", (req, res) => {
    const authorizationUrl = client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"]
    });
    res.redirect(authorizationUrl);
});

// Handle the callback from Google and retrieve the user's profile
app.get("/auth/callback", async (req, res) => {
    const code = req.query.code;
    try {
        const {tokens} = await client.getToken(code);
        client.setCredentials(tokens);

        // Get user profile information
        const oauth2 = google.oauth2({
            auth: client,
            version: "v2"
        });

        const userInfo = await oauth2.userinfo.get();

        // Send the user's profile information as the response
        res.json({
            name: userInfo.data.name,
            email: userInfo.data.email,
            picture: userInfo.data.picture
        });
    } catch (error) {
        res.status(500).send("Error retrieving user profile: " + error.message);
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
