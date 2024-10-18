const { google } = require('googleapis');

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

let tokens; // Armazena os tokens

// Função para gerar URL de autenticação
const getAuthUrl = () => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/documents'
        ],
    });
    return authUrl;
};

// Função para obter tokens
const getTokens = async (code) => {
    const { tokens: newTokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(newTokens);
    tokens = newTokens; // Armazena tokens
    return tokens;
};

module.exports = {
    getAuthUrl,
    getTokens
};