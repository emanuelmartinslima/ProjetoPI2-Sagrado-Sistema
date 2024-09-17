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

app.listen(8081, function () {
    console.log("Servidor ativo! Port: 8081");
});