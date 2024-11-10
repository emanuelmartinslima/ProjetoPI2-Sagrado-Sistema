const db = require("./conexaoBanco.js");

const Produtos = db.sequelize.define("produtos", {
    nome: {
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
    },
    imagem: {
        type: db.Sequelize.TEXT
    },
    quantidadeEstoque: {
        type: db.Sequelize.INTEGER
    }
});

// Produtos.sync({force: true});

module.exports = Produtos;
