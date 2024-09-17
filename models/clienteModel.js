const db = require("./conexaoBanco.js");

const Clientes = db.sequelize.define("clientes", {
    nome: {
        type: db.Sequelize.STRING
    },
    cpf: {
        type: db.Sequelize.STRING
    },
    cnpj:{
        type: db.Sequelize.STRING
    }
});

Clientes.sync({force: true});

module.exports = Clientes;