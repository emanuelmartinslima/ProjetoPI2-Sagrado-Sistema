const db = require("./conexaoBanco.js");

const Usuarios = db.sequelize.define("usuarios", {
    cargo: {
        type: db.Sequelize.STRING,
        defaultValue: "operador"
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
    }
});

 //Usuarios.sync({alter: true});

module.exports = Usuarios;