const axios = require("axios");
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
require("dotenv").config();

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

// Load client secrets from a local file.
fs.readFile("oauth.json", async (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  // Authorize a client with credentials, then call the Google Sheets API.
  await authorize(JSON.parse(content), listMajors);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
async function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error(
          "Error while trying to retrieve access token",
          err
        );
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

async function listMajors(auth) {
  const sheets = google.sheets({ version: "v4", auth });
  sheets.spreadsheets.values.get(
    {
      spreadsheetId: "1TceIKuv_R7cJBU7fO4k3vAn9bAiPAXIzir7Wc-ltLJI",
      range: "A:C",
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      const rows = res.data.values;
      if (rows.length) {
        // Print columns A to C, which correspond to indices 0 and 2.
        rows.map(async (row) => {
          const number = row[0];
          if (number.toString() !== "0") {
            const sanitized_number = number.toString().replace(/[- )(]/g, ""); // remove unnecessary chars from the number
            const final_number = `57${sanitized_number.substring(
              sanitized_number.length - 10
            )}`; // add 57 before the number here 57 is country code

            // Create the message that it will be send
            const msg = `${row[1]} 🔊 *¿Quieres aprender más sobre LingoChamp y, además, tener la oportunidad de ganarte un bono Éxito?* 🔊
             Queremos invitarte *hoy a las 5:00 pm* a una sesión de concurso en vivo por nuestro Canal de YouTube *LingoChamp Colombia* 🤩
             👉🏻 Aquí te dejamos el enlace: https://www.youtube.com/channel/UC6fCvJdR2EkMB9C6y38_iIw
             *¡Te esperamos!*`;
            //SEND THE MESSAGE

            // https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages
            const data = JSON.stringify({
              messaging_product: "whatsapp",
              //TODO: REPLACE WITH VAR final_number
              to: "573006624294",
              type: "text",
              text: {
                body: msg,
              },
              /*template: {
                name: "hello_world",
                language: {
                  code: "en_US",
                },
              },*/
            });

            var config = {
              method: "post",
              url: `https://graph.facebook.com/v13.0/${process.env.PhoneNumberId}/messages`,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.AccessToken}`,
              },
              data: data,
            };
            try {
              const response = await axios(config);
              return console.log(response);
            } catch (error) {
              console.error(error);
            }

            console.log(`${row[1]},${row[0]},send`);
          } else {
            console.log(`${row[1]},${row[0]},no_number`);
          }
        });
      } else {
        console.log("No data found.");
      }
    }
  );
}
