const db = require("./conexaoBanco.js");

const Contratos = db.sequelize.define("contratos", {
    idCliente: {
        type: db.Sequelize.INTEGER
    },
    idOperador: {
        type: db.Sequelize.FLOAT
    },
    valor: {
        type: db.Sequelize.FLOAT
    },
    horarioMontagem: {
        type: db.Sequelize.TIME
    },
    horarioEncerramento: {
        type: db.Sequelize.TIME
    },
    enderecoEvento: {
        type: db.Sequelize.STRING
    },
    dataEvento: {
        type: db.Sequelize.DATEONLY
    },
    quantidadeProdutos: {
        type: db.Sequelize.INTEGER
    },
    formaPagamento: {
        type: db.Sequelize.STRING
    },
    dataPagamento: {
        type: db.Sequelize.DATEONLY
    },
    numeroParcelas: {
        type: db.Sequelize.INTEGER
    },
    idDocumento: {
        type: db.Sequelize.STRING
    },
    nomeDocumento: {
        type: db.Sequelize.STRING
    },
    lista: {
        type: db.Sequelize.INTEGER
    },
    pago: {
        type: db.Sequelize.BOOLEAN
    }
});

const Parcela = require("./parcelaModel.js"); // Importando a model Parcela

Contratos.hasMany(Parcela, { foreignKey: "contratoId" });
Parcela.belongsTo(Contratos, { foreignKey: "id" });

//Contratos.sync({alter: true});

module.exports = Contratos;