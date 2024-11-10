const db = require("./conexaoBanco");

const ListaProdutos = db.sequelize.define("listaProdutos", {
    valorTotal: {
        type: db.Sequelize.INTEGER
    }
});

// ListaProdutos.sync({force: true});

module.exports = ListaProdutos;