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
        type: db.Sequelize.TEXT // Altera de BLOB para TEXT para armazenar a string Base64
    }
});

// Produtos.sync({force: true}); // Use isso se você quiser reinicializar a tabela e perder os dados

module.exports = Produtos;
