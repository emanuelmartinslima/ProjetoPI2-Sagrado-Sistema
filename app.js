const express = require("express");
const path = require("path");

const app = express();

const bodyParser = require("body-parser");
const handlebars = require("handlebars");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const {google} = require("googleapis");
const fs = require("fs");

const cliente = require("./models/clienteModel.js");
const contrato = require("./models/contratoModel.js");
const item = require("./models/itemModel.js");
const Usuario = require("./models/usuarioModel.js");
const produto = require("./models/produtoModel.js");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

app.set('view engine', 'hbs');

const imagesDirectory = path.join(publicDirectory, "./images");
app.use(express.static(imagesDirectory));

app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth.js"));

const oauth2Client = new google.auth.OAuth2({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

try {
    const creds = fs.readFileSync("creds.json");
    oauth2Client.setCredentials(JSON.parse(creds));
} catch (error) {
    console.log("Creds não encontrado!" + error);
}

app.get("/auth/google", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/documents",
            "https://www.googleapis.com/auth/drive"
        ]
    });

    res.redirect(url);
});

app.get("/google/redirect", async (req, res) => {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    fs.writeFileSync("creds.json", JSON.stringify(tokens));
    res.redirect("/telaInicial");
});

// app.get("/copiarDocumento/:algumTexto", async (req, res)=>{
//     const drive = google.drive({
//         version: 'v3',
//         auth: oauth2Client
//     });

//     const algumTexto = req.params.algumTexto;

//     await drive.files.create({
//       requestBody: {
//             name: 'text.txt',
//             mimeType: 'text/plain'
//         },
//         media: {
//             mimeType: 'text/plain',
//             body: algumTexto
//         }
//     });

//     return "Success";
// });

async function criarOperador() {
    try {
        const senha = "123";

        const salt = await bcrypt.genSalt(12);

        const hashPassword = await bcrypt.hash(senha, salt);

        const novoOperador = await Usuario.create({
            cargo: "operador",
            email: "operador@gmail.com",
            senha: hashPassword,
            nome: "Operador da Silva",
            cpf: "12345678910"
        });

        console.log("Operador criado com sucesso:", novoOperador.toJSON());
    } catch (error) {
        console.error("Erro ao criar operador:", error);
    }
};

async function criarGerente() {
    try {
        const senha = "321";

        const salt = await bcrypt.genSalt(12);

        const hashPassword = await bcrypt.hash(senha, salt);

        const novoGerente = await Usuario.create({
            cargo: "gerente",
            email: "gerente@gmail.com",
            senha: hashPassword,
            nome: "Gerente da Silva",
            cpf: "10987654321"
        });

        console.log("Operador criado com sucesso:", novoGerente.toJSON());
    } catch (error) {
        console.error("Erro ao criar operador:", error);
    }
}

 //criarOperador();
 //criarGerente();

app.listen(8081, function () {
    console.log("Servidor ativo! Port: 8081");
});