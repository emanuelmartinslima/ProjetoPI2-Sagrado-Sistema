const db = require("./conexaoBanco.js");

const Produtos = db.sequelize.define("produtos", {
    descricao: {
        type: db.Sequelize.TEXT
    },
    valorUnidade: {
        type: db.Sequelize.FLOAT
    },
    disponibilidade: {
        type: db.Sequelize.BOOLEAN
    },
    estado: {
        type: db.Sequelize.TEXT
    },
    dimensoes: {
        type: db.Sequelize.TEXT
    }
});

Produtos.sync({force: true});

module.exports = Produtos;