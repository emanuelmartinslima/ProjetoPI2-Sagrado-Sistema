const { Op } = require("sequelize");
const multer = require('multer');
const sharp = require('sharp');
const produto = require("../models/produtoModel");

// Configuração do multer para armazenar a imagem na memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Função para registrar um novo produto
exports.registrarProduto = async (req, res) => {
    const { nome, dimensoes, estado, valorUnidade, disponibilidade } = req.body;
    const imagem = req.file;

    // Verifica se todos os campos foram preenchidos
    if (!nome || !dimensoes || !estado || !valorUnidade || !imagem) {
        return res.status(400).json({ error: "Por favor, preencha todos os campos." });
    }

    try {
        // Comprimir e redimensionar a imagem
        const compressedImageBuffer = await sharp(imagem.buffer)
            .resize(800) // Ajuste a largura máxima que você deseja
            .toFormat('jpeg', { quality: 80 }) // Ajuste a qualidade conforme necessário
            .toBuffer();

        // Converte a imagem comprimida para Base64
        const base64Image = compressedImageBuffer.toString('base64');

        await produto.create({
            nome: nome,
            dimensoes: dimensoes,
            estado: estado,
            valorUnidade: valorUnidade,
            imagem: base64Image, // Salva a imagem em Base64 no banco de dados
            disponibilidade: disponibilidade ? true : false
        });

        console.log("Dados cadastrados com sucesso!");
        res.redirect("/formCadastrarProdutos");
    } catch (error) {
        console.error("Erro ao cadastrar produto:", error);
        res.status(500).send("Erro ao cadastrar produto: " + error.message);
    }
};

// Função para buscar todos os produtos
exports.buscarProdutos = async (req, res) => {
    try {
        const produtosList = await produto.findAll();
        console.log("Produtos retornados:", produtosList); // Log para depuração
        res.json(produtosList);
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        res.status(500).json({ message: "Erro ao buscar produtos." });
    }
};

exports.buscarProdutosDisponiveis = async (req, res) => {
    try {
        const produtosList = await produto.findAll({ where : { disponibilidade : 1 }});
        console.log("Produtos retornados:", produtosList); // Log para depuração
        res.json(produtosList);
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        res.status(500).json({ message: "Erro ao buscar produtos." });
    }
};

// Função para editar um produto existente
exports.editarProduto = async (req, res) => {
    const { id } = req.params; // Assume que o ID do produto está na URL
    const { nome, dimensoes, estado, valorUnidade, disponibilidade } = req.body; // Adicionado `disponibilidade`
    const imagem = req.file;

    // Verifica se pelo menos um campo obrigatório foi preenchido
    if (!nome && !dimensoes && !estado && !valorUnidade && !imagem && disponibilidade === undefined) {
        return res.status(400).json({ error: "Por favor, preencha pelo menos um campo." });
    }

    try {
        // Busca o produto existente
        const produtoExistente = await produto.findByPk(id);
        if (!produtoExistente) {
            return res.status(404).json({ error: "Produto não encontrado." });
        }

        // Inicializa um objeto para armazenar as alterações
        const updatedData = {};

        // Verifica quais campos foram modificados e atualiza o objeto
        if (nome) updatedData.nome = nome;
        if (dimensoes) updatedData.dimensoes = dimensoes;
        if (estado) updatedData.estado = estado;
        if (valorUnidade) updatedData.valorUnidade = valorUnidade;

        // Processa a disponibilidade
        if (disponibilidade !== undefined) {
            updatedData.disponibilidade = disponibilidade === 'on'; // Converte o valor para booleano
        }else{
            updatedData.disponibilidade = disponibilidade === 'off';
        }

        // Se uma nova imagem for enviada, processa e adiciona ao objeto
        if (imagem) {
            const compressedImageBuffer = await sharp(imagem.buffer)
                .resize(800) // Ajuste a largura máxima que você deseja
                .toFormat('jpeg', { quality: 80 }) // Ajuste a qualidade conforme necessário
                .toBuffer();
            updatedData.imagem = compressedImageBuffer.toString('base64'); // Converte a imagem para Base64
        }

        // Atualiza o produto no banco de dados
        await produto.update(updatedData, { where: { id } });

        console.log("Produto atualizado com sucesso!");
        res.json({ message: "Produto atualizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        res.status(500).send("Erro ao atualizar produto: " + error.message);
    }
};

// Função para buscar um produto específico
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

// Função para deletar um produto
exports.deletarProduto = async (req, res) => {
    const { id } = req.params; // Obtém o ID do produto a partir dos parâmetros da URL

    try {
        // Busca o produto pelo ID
        const produtoExistente = await produto.findByPk(id);
        if (!produtoExistente) {
            return res.status(404).json({ error: "Produto não encontrado." });
        }

        // Deleta o produto
        await produto.destroy({ where: { id } });

        console.log("Produto deletado com sucesso!");
        res.status(200).json({ message: "Produto deletado com sucesso!" });
    } catch (error) {
        console.error("Erro ao deletar produto:", error);
        res.status(500).send("Erro ao deletar produto: " + error.message);
    }
};

// Exporta o middleware do multer para ser utilizado nas rotas
exports.upload = upload;