const express = require("express");
const path = require("path");

const app = express();

const bodyParser = require("body-parser");
const handlebars = require("handlebars");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

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