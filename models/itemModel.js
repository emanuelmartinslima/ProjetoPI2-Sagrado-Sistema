const db = require("./conexaoBanco.js");

const Items = db.sequelize.define("items", {
    produtoId: {
        type: db.Sequelize.INTEGER
    },
    quantidade: {
        type: db.Sequelize.INTEGER
    },
    valor: {
        type: db.Sequelize.FLOAT
    },
    lista: {
        type: db.Sequelize.INTEGER
    }
});

//Items.sync({force: true});

module.exports = Items;