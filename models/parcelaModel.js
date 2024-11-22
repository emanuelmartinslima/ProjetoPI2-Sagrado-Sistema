const db = require("./conexaoBanco.js");

const Parcela = db.sequelize.define("parcelas", {
    contratoId: {
        type: db.Sequelize.INTEGER,
        allowNull: false
    },
    dataPagamento: {
        type: db.Sequelize.DATEONLY,
        allowNull: false
    },
    valorParcela: {
        type: db.Sequelize.FLOAT,
        allowNull: false
    },
    pago: {
        type: db.Sequelize.BOOLEAN,
        defaultValue: false
    }
});

// Parcela.sync({ alter: true });

module.exports = Parcela;
