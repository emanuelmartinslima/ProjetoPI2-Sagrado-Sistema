const operador = require("../models/operadorModel");

exports.atualizar = async (req, res) => {
    const {nome, cpf, email} = req.body

    try{

        const verificarOperador = await operador.findOne({where: {cpf: cpf}});

        if(!verificarOperador){

            return;

        } else{

            operador.update({nome: nome, email: email}, {where: {cpf: cpf}});
            res.redirect("/telaInicialOp");
    
        }
                
    } catch(error){
        
        console.log(error);
        res.status(500).json({message: "Erro no servidor"});
    
    }

}

exports.atualizarGerente = async (req, res) => {
    const {nome, cpf, email} = req.body

    try{

        const verificarOperador = await operador.findOne({where: {cpf: cpf}});

        if(!verificarOperador){

            return;

        } else{

            operador.update({nome: nome, email: email}, {where: {cpf: cpf}});
            res.redirect("/telaInicialGerente");
    
        }
                
    } catch(error){
        
        console.log(error);
        res.status(500).json({message: "Erro no servidor"});
    
    }

}