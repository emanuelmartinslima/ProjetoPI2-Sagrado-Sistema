const db = require("./conexaoBanco.js");

const Operadores = db.sequelize.define("operadores", {
    gerente: {
        type: db.Sequelize.BOOLEAN
    },
    email:{
        type: db.Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    senha: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    nome: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    cpf: {
        type: db.Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    cnpj: {
        type: db.Sequelize.STRING,
    },
    salario: {
        type: db.Sequelize.FLOAT
    },
    comissao: {
        type: db.Sequelize.FLOAT
    }
});

// Operadores.sync({force: true});

module.exports = Operadores;