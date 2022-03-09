const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('oauth.json', async (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
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
    client_id, client_secret, redirect_uris[0]);

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
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 * https://docs.google.com/spreadsheets/d/1TceIKuv_R7cJBU7fO4k3vAn9bAiPAXIzir7Wc-ltLJI/edit?usp=sharing
 */
async function listMajors(auth) {

  const client = new Client();

  client.on('qr', (qr) => {

    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    console.log('Client is ready!');
  });

  client.on('message', async msg => {
    if (msg.body == '!ping') {
      console.log('SENDING MESSAGESSSSS')
      const sheets = google.sheets({ version: 'v4', auth });
      sheets.spreadsheets.values.get({
        spreadsheetId: '1TceIKuv_R7cJBU7fO4k3vAn9bAiPAXIzir7Wc-ltLJI',
        range: 'A:B',
      }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
          // Print columns A and E, which correspond to indices 0 and 4.
          rows.map(async (row) => {
            const number = row[0];
            if (number.toString() !== '0') {
              const sanitized_number = number.toString().replace(/[- )(]/g, ""); // remove unnecessary chars from the number
              const final_number = `57${sanitized_number.substring(sanitized_number.length - 10)}`; // add 91 before the number here 91 is country code of India
              try {
                const number_details = await client.getNumberId(final_number); // get mobile number details
                //console.log(number_details)
                if (number_details) {
                  const sendMessageData = await client.sendMessage(number_details._serialized, "*HOLA " + row[1] + "✨*\
                  \n\nSabemos que estás comprometido(a) con tu proceso de aprendizaje de Inglés con LingoChamp y por eso queremos que aproveches el tiempo que te queda con todos los contenidos del Currículo Básico⏰\
                  \nAl finalizar cada nivel, la app te genera un CERTIFICADO con su equivalencia con el Marco Común Europeo!🧾\
                  \nAquí te dejamos el paso a paso para que lo descargues antes de que se te acabe el tiempo: https://docs.google.com/viewerng/viewer?url=https://lingoayuda.com/wp-content/uploads/2022/03/COMO-DESCARGAR-MIS-CERTIFICADOS-V-5.0.1.pdf \
                  \n\n¡Recuerda que si completas 2 niveles te activaremos el Curso de Negocios por 3 meses! ¡Sigue avanzando con LingoChamp!🤳🏾"); // send message
                  console.log(number, "Sended");
                } else {
                  console.log(number, "Mobile number is not registered");
                }
              } catch (error) {
                console.log("ERROR WTIH NUMBER", number)
              }
            }
          });
          console.log('FINISH HIM !!!')
        } else {
          console.log('No data found.');
        }
      });
    }
  });

  client.initialize();

}


