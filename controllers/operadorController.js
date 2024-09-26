const operador = require("../models/operadorModel");

exports.atualizar = async (req, res) => {
    const {nome, cpf, email} = req.body

    try{

        const verificarOperador = await operador.findOne({where: {cpf: cpf}});

        if(!verificarOperador){

            res.json("Operador não existente!");

        } else{

            operador.update({nome: nome, email: email}, {where: {cpf: cpf}});
            res.json({message: "Usuário alterado com sucesso!"});
    
        }
                
    } catch(error){
        
        console.log(error);
        res.status(500).json({message: "Erro no servidor"});
    
    }

}