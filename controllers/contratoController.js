exports.registerContrato = async (req, res) => {
    console.log(req.body);
    const {Op} = require("sequelize");
    const contrato = require("../models/contratoModel");
    const { nome, cpfCnpj, endereco, contato } = req.body;

        cliente.create({
            nome: nome,
            cpfCnpj: cpfCnpj,
            endereco: endereco,
            contato: contato
        }).then(() => {
            console.log("Dados cadastrados com sucesso!")
            res.render("cadastrarCliente");
        }).catch((error) => {
            console.log("Erro: ", error)
        });
    }

    //registro de contrato ainda incompleto