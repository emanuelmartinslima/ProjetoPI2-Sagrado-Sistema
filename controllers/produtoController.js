const { Op } = require("sequelize");
const multer = require('multer');
const sharp = require('sharp');
const produto = require("../models/produtoModel");
const Contrato = require("../models/contratoModel");
const ListaProdutos = require("../models/listaProdutos");
const Item = require("../models/itemModel");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.registrarProduto = async (req, res) => {
    const { nome, dimensoes, estado, valorUnidade, disponibilidade } = req.body;
    const imagem = req.file;

    if (!nome || !dimensoes || !estado || !valorUnidade || !imagem) {
        return res.status(400).json({ error: "Por favor, preencha todos os campos." });
    }

    try {
        const compressedImageBuffer = await sharp(imagem.buffer)
            .resize(800)
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();
        const base64Image = compressedImageBuffer.toString('base64');

        await produto.create({
            nome: nome,
            dimensoes: dimensoes,
            estado: estado,
            valorUnidade: valorUnidade,
            imagem: base64Image,
            disponibilidade: disponibilidade ? true : false
        });

        console.log("Dados cadastrados com sucesso!");
        res.redirect("/formCadastrarProdutos");
    } catch (error) {
        console.error("Erro ao cadastrar produto:", error);
        res.status(500).send("Erro ao cadastrar produto: " + error.message);
    }
};

exports.buscarProdutos = async (req, res) => {
    try {
        const produtosList = await produto.findAll();
        console.log("Produtos retornados:", produtosList);
        res.json(produtosList);
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        res.status(500).json({ message: "Erro ao buscar produtos." });
    }
};

exports.buscarProdutosDisponiveis = async (req, res) => {
    try {
        const { dataEvento } = req.params;
        const contratos = await Contrato.findAll({
            where: {
                dataEvento: dataEvento
            }
        });

        if(contratos){
            const mapProdutos = new Map();
            const mapProdutosIndisponiveis = new Map();
    
            for(let contrato of contratos){
                console.log("Contratos na busca de produtos disponíveis: " + contrato.id);
                const lista = await ListaProdutos.findByPk(contrato.lista);
                console.log("Lista associada ao contrato: " + lista.id);
                const items = await Item.findAll({ where: { lista: lista.id } });
                for(let item of items){
                    const produtos = await produto.findByPk(item.produtoId);
                    console.log(`Item associados a lista de produtos do contrato n° ${contrato.id}: ${item.id}\nProduto: ${produtos.nome}`);
    
                    let mapTemProduto = mapProdutos.has(produtos.id);
                    console.log("Mapa já tem esse produto: " + mapTemProduto);
    
                    if(!mapTemProduto) {
                        mapProdutos.set(produtos.id, produtos.quantidadeEstoque);
                        console.log("Tentando adicionar produto ao map\n" + mapProdutos.get(produtos.id) + `\nProduto: ${produtos.id} e quantidade ${produtos.quantidadeEstoque}`);
                    }
    
                    mapTemProduto = mapProdutos.has(produtos.id);
                    console.log("Mapa já tem esse produto: " + mapTemProduto);
    
                    if (mapTemProduto) {
                        mapProdutos.set(produtos.id, mapProdutos.get(produtos.id) - 1);
                        console.log("Tentando controlar a quantidade de produtos dentro do map\n" + mapProdutos.get(produtos.id) + `\nProduto: ${produtos.id} e quantidade ${produtos.quantidadeEstoque}`);
    
                        mapProdutos.forEach((value, key, map)=>{
                            console.log("Tentando colocar algum produto no map de produtos indisponíveis");
                            if(value <= 0){
                                mapProdutosIndisponiveis.set(key, key);
                                console.log("Map de produtos indisponíveis: " + key + " " + mapProdutosIndisponiveis.get(key));
                            }
                        })
                    } 
                };
            };
    
            const chavesProdutosIndisponiveis = Array.from(mapProdutosIndisponiveis.keys());
            console.log("Operação efetuada" + chavesProdutosIndisponiveis);
    
            const listaProdutos = await produto.findAll({
                where: {
                    id: {
                        [Op.notIn]: chavesProdutosIndisponiveis
                    },
                    disponibilidade: 1
                }
            });

            console.log(listaProdutos);
            res.json(listaProdutos);
        } else {
            const listaProdutos = await produto.findAll();
            console.log(listaProdutos);
            res.json(listaProdutos);
        }
        // mapProdutos.forEach((valor, chave) => {
        //     console.log("Tentando colocar os produtos indisponíveis no map de produtos indisponíveis");
        //     if(valor <= 0){
        //         mapProdutosIndisponiveis.set(chave, valor);
        //     }
        // });

        // const produtosList = await produto.findAll({ where: { disponibilidade: 1 } });
        // console.log("Produtos retornados:", produtosList);
        
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        res.status(500).json({ message: "Erro ao buscar produtos." });
    }
};

exports.editarProduto = async (req, res) => {
    const { id } = req.params;
    const { nome, dimensoes, estado, valorUnidade, disponibilidade } = req.body;
    const imagem = req.file;

    if (!nome && !dimensoes && !estado && !valorUnidade && !imagem && disponibilidade === undefined) {
        return res.status(400).json({ error: "Por favor, preencha pelo menos um campo." });
    }

    try {
        const produtoExistente = await produto.findByPk(id);
        if (!produtoExistente) {
            return res.status(404).json({ error: "Produto não encontrado." });
        }

        const updatedData = {};
        if (nome) updatedData.nome = nome;
        if (dimensoes) updatedData.dimensoes = dimensoes;
        if (estado) updatedData.estado = estado;
        if (valorUnidade) updatedData.valorUnidade = valorUnidade;
        if (disponibilidade !== undefined) {
            updatedData.disponibilidade = disponibilidade === 'on';
        } else {
            updatedData.disponibilidade = disponibilidade === 'off';
        }
        if (imagem) {
            const compressedImageBuffer = await sharp(imagem.buffer)
                .resize(800)
                .toFormat('jpeg', { quality: 80 })
                .toBuffer();
            updatedData.imagem = compressedImageBuffer.toString('base64');
        }
        await produto.update(updatedData, { where: { id } });
        console.log("Produto atualizado com sucesso!");
        res.json({ message: "Produto atualizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        res.status(500).send("Erro ao atualizar produto: " + error.message);
    }
};

exports.buscarProdutoPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const produtoEncontrado = await produto.findByPk(id);
        if (!produtoEncontrado) {
            return res.status(404).json({ error: "Produto não encontrado." });
        }
        res.json(produtoEncontrado);
    } catch (error) {
        console.error("Erro ao buscar produto:", error);
        res.status(500).json({ message: "Erro ao buscar produto." });
    }
};

exports.deletarProduto = async (req, res) => {
    const { id } = req.params;

    try {
        const produtoExistente = await produto.findByPk(id);
        if (!produtoExistente) {
            return res.status(404).json({ error: "Produto não encontrado." });
        }
        await produto.destroy({ where: { id } });
        console.log("Produto deletado com sucesso!");
        res.status(200).json({ message: "Produto deletado com sucesso!" });
    } catch (error) {
        console.error("Erro ao deletar produto:", error);
        res.status(500).send("Erro ao deletar produto: " + error.message);
    }
};

exports.upload = upload;