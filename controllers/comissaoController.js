const Contrato = require("../models/contratoModel");
const {Op} = require("sequelize");

exports.calcularComissao = async(req, res) => {
    const {operador, mes, ano} = req.params;

    const contratos = await Contrato.findAll({
        where: {
            idOperador: operador.slice(-1),
            createdAt: {
                [Op.between]: [
                    new Date(`${ano}-${mes}-1`),
                    new Date(`${ano}-${mes}-31`)
                ]
            }
        }
    });

    let comissao = 0;

    contratos.forEach(contrato => {
        comissao += contrato.valor;
    });

    comissao = comissao * 0.03;

    res.json(comissao);
}