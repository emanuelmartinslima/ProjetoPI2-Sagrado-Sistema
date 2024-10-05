const db = require("./conexaoBanco.js");

const Usuarios = db.sequelize.define("usuarios", {
    cargo: {
        type: db.Sequelize.STRING
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

// Usuarios.sync({force: true});

module.exports = Usuarios;