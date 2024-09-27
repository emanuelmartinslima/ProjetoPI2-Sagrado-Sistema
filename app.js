const express = require("express");
const path = require("path");

const app = express();

const bodyParser = require("body-parser");
const handlebars = require("handlebars");

const cliente = require("./models/clienteModel.js");
const contrato = require("./models/contratoModel.js");
const item = require("./models/itemModel.js");
const operador = require("./models/operadorModel.js");
const produto = require("./models/produtoModel.js");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

app.set('view engine', 'hbs');

const imagesDirectory = path.join(publicDirectory, "./images");
app.use(express.static(imagesDirectory));

app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth.js"));

// Criação de operador
async function criarOperador() {
    try {
        const novoOperador = await operador.create({
            gerente: false,              
            email: "a@gmail.com",       
            senha: "123",       
            nome: "Operador da Silva",   
            cpf: "12345678910"
        });

        console.log("Operador criado com sucesso:", novoOperador.toJSON());
    } catch (error) {
        console.error("Erro ao criar operador:", error);
    }

}

// Criação de registro ao iniciar a aplicação
async function criarGerente() {
    try {
        const novoGerente = await operador.create({
            gerente: true,              
            email: "b@gmail.com",       
            senha: "321",       
            nome: "Gerente da Silva",   
            cpf: "10987654321"
        });

        console.log("Operador criado com sucesso:", novoGerente.toJSON());
    } catch (error) {
        console.error("Erro ao criar operador:", error);
    }

}

// Chamando a função ao iniciar a aplicação
// criarOperador();
// criarGerente();

app.listen(8081, function () {
    console.log("Servidor ativo! Port: 8081");
});
