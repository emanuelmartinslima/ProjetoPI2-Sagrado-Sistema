const { google } = require("googleapis");
const fs = require("fs");
const Cliente = require("../models/clienteModel");
const Item = require("../models/itemModel");
const Produto = require("../models/produtoModel");
const moment = require("moment");

const oauth2Client = new google.auth.OAuth2({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

exports.gerarEventoContrato = async (contrato, lista) => {
    try {
        const creds = fs.readFileSync("creds.json");
        const tokens = JSON.parse(creds);
        oauth2Client.setCredentials(tokens);

        const calendar = await google.calendar({
            version: 'v3',
            auth: oauth2Client
        });

        const cliente = await Cliente.findByPk(contrato.idCliente);

        const items = await Item.findAll({ where: { lista: lista.id } });

        let tituloEvento = ``;

        for (const item of items) {
            const produto = await Produto.findByPk(item.produtoId);

            tituloEvento += `${produto.nome}\n`;
        }

        let descricaoEvento = `${tituloEvento}    
Montagem: ${contrato.horarioMontagem}
Horário do Evento: ${contrato.horarioMontagem}
Desmontagem: ${contrato.horarioEncerramento}
        `;

        const dataInicioEvento = moment(`${contrato.dataEvento}T${contrato.horarioMontagem}`).toISOString();
        const dataEncerramentoEvento = moment(`${contrato.dataEvento}T${contrato.horarioEncerramento}`).toISOString();

        const evento = {
            'summary': tituloEvento += ` - ${cliente.nome}`,
            'location': `${contrato.enderecoEvento}`,
            'description': `${descricaoEvento}`,
            'start': {
                'dateTime': dataInicioEvento,
                'timeZone': 'America/Sao_Paulo'
            },
            'end': {
                'dateTime': dataEncerramentoEvento,
                'timeZone': 'America/Sao_Paulo'
            },
            'reminders': {
                'method': 'email',
                'minutes': 30
            }
        }

        await calendar.events.insert({
            auth: oauth2Client,
            calendarId: "admsagradoneon@gmail.com",
            resource: evento
        });

        console.log("Chegou até evento");
    } catch (error) {
        console.log("Ocorreu um erro ao tentar criar o evento: " + error);
    }
}