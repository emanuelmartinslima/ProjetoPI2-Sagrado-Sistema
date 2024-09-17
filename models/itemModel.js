const db = require("./conexaoBanco.js");

const Items = db.sequelize.define("items", {
    quantidade: {
        type: db.Sequelize.INTEGER
    },
    valor: {
        type: db.Sequelize.FLOAT
    }
});