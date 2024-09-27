const db = require("./conexaoBanco.js");

const Clientes = db.sequelize.define("clientes", {
    nome: {
        type: db.Sequelize.STRING
    },
    cpfCnpj: {
        type: db.Sequelize.STRING
    },
    endereco: {
        type: db.Sequelize.TEXT
    },
    contato: {
        type: db.Sequelize.STRING
    }
});

Clientes.sync({force: true});

module.exports = Clientes;