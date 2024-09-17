const db = require("./conexaoBanco.js");

const Contratos = db.sequelize.define("contratos", {
    valor: {
        type: db.Sequelize.FLOAT
    },
    dataGerado: {
        type: db.Sequelize.DATEONLY
    },
    horaMontagem: {
        type: db.Sequelize.TIME
    },
    dataEvento: {
        type: db.Sequelize.TIME
    },
    encerramentoEvento: {
        type: db.Sequelize.TIME
    },
    formaPagamento: {
        type: db.Sequelize.STRING
    }
});

Contratos.sync({force: true});

module.exports = Contratos;