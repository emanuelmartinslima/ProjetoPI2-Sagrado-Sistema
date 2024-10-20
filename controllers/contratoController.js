const Contrato = require("../models/contratoModel");
const Cliente = require("../models/clienteModel");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, Alignment, Header, Media , ImageRun} = require("docx");
const { text } = require("body-parser");

exports.registrarContrato = async (req, res) => {
    const { cpfCnpj, dataEvento, horarioMontagem, horarioEncerramento, enderecoEvento, quantidadeProdutos, formaPagamento, dataPagamento, numeroParcelas, valorTotal } = req.body;

    const body = req.body

    const cliente = await Cliente.findOne({ where: { cpfCnpj: cpfCnpj } });

    console.log(cliente);
    const token = req.cookies.token;
    const secret = process.env.SECRET;
    const payloadToken = jwt.verify(token, secret);

    Contrato.create({
        idCliente: cliente.id,
        idOperador: payloadToken.id,
        valor: valorTotal,
        horarioMontagem: horarioMontagem,
        horarioEncerramento: horarioEncerramento,
        enderecoEvento: enderecoEvento,
        dataEvento: dataEvento,
        quantidadeProdutos: quantidadeProdutos,
        formaPagamento: formaPagamento,
        dataPagamento: dataPagamento,
        numeroParcelas: numeroParcelas
    }).then(() => {
        console.log("Contrato criado com sucesso!")
        // automatizarContrato(cliente, contrato);
        const replacements = {
            "{{nomeCliente}}": `${cliente.nome}`,
            "{{cpfCnpj}}": `${cliente.cpfCnpj}`,
            "{{enderecoCliente}}": `${cliente.endereco}`,
            "{{dataEvento}}": `${dataEvento}`,
            "{{horarioMontagem}}": `${horarioMontagem}`,
            "{{horarioEncerramento}}": `${horarioEncerramento}`,
            "{{enderecoEvento}}": `${enderecoEvento}`,
            "{{valor}}": `${valorTotal}`,
            "{{formaPagamento}}": `${formaPagamento}`
        };
        substituirCampos(templatePath, outputPath, replacements, body, cliente);
        res.redirect("/telaInicial");
    }).catch((error) => {
        console.log("Erro: ", error)
    });
}

const templatePath = path.join(__dirname, "Contrato Espelho.docx");
const outputPath = path.join(__dirname, "output.docx");

async function substituirCampos(templatePath, outputPath, replacements, body, cliente) {
    try {
        const data = new Date();

        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDay()).padStart(2, '0');
        const ano = data.getFullYear();

        const dataFormatada = `${dia}${mes}`;

        const imagemLogo= fs.readFileSync(path.join(__dirname, "logo.jpeg"));
        const imagemAssinatura = fs.readFileSync(path.join(__dirname, "assinatura.jpeg"));

        // Criar um novo documento Word
        const doc = new Document({
            sections: [
                // {
                //     headers: {
                //         default: new Header({
                //             children: [
                //                 new Paragraph(
                //                     {
                //                         children: [
                //                             new ImageRun({
                //                                 data: imagemLogo,
                //                                 transformation: {
                //                                     width: 97,
                //                                     height: 97
                //                                 }
                //                             })
                //                         ],
                //                         alignment: Alignment.LEFT
                //                     }
                //                 )
                //             ]
                //         })
                //     }
                // },
                {
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS E LOCAÇÃO",
                                    alignment: "center",
                                    bold: true
                                })
                            ],
                            spacing: {
                                after: 300
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Pelo presente instrumento particular e na melhor forma de direito, as partes a seguir qualificadas, de um lado ${cliente.nome} pessoa física, CPF ou CNPJ: ${body.cpfCnpj},   Endereço Residencial ou Comercial: ${cliente.endereco}, doravante denominada `,
                                }),
                                new TextRun({
                                    text: "CONTRATANTE",
                                    bold: true
                                }),
                                new TextRun({
                                    text: " e, do outro Lado ",
                                }),
                                new TextRun({
                                    text: "SAGRADO NEON",
                                    bold: true
                                }),
                                new TextRun({
                                    text: " inscrita no CNPJ sob o nº 42.593.312/0001-04, neste ato representada por Luiz Carlos Blasques, inscrito na receita federal através do CPF Nº 428.963.018-95 e portador do RG Nº 36.860.179-1 SSP/SP residente e domiciliado na Rua Campo das Pitangueiras, 600 casa 30  Jd São nicolau/SP,telefone:(11)94101-1464, doravante denominada ",
                                }),
                                new TextRun({
                                    text: "CONTRATADA",
                                    bold: true
                                }),
                                new TextRun({
                                    text: ", firmam o presente contrato de Prestação de Serviços, mediante as seguintes cláusulas e condições:",
                                })
                            ],
                            spacing: {
                                after: 150
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "CLÁUSULA PRIMEIRA – DO OBJETO:",
                                    bold: true,
                                })
                            ]
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "1.1 - Constitui objeto do presente a locação por parte da "
                                }),
                                new TextRun({
                                    text: "CONTRATANTE",
                                    bold: true
                                }),
                                new TextRun({
                                    text: " dos itens discriminados no parágrafo a seguir, sendo todos disponibilizado pelo "
                                }),
                                new TextRun({
                                    text: "CONTRATADO",
                                    bold: true
                                }),
                                new TextRun({
                                    text: " na data descrita a seguir:"
                                })
                            ],
                            spacing: {
                                before: 150,
                                after: 150
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Item: Item Escolhido",
                                    bold: true
                                })
                            ]
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Dimensões Aproximadas: 2m x 2m",
                                    bold: true
                                })
                            ]
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Obs:",
                                    bold: true
                                })
                            ]
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "1.2 - O objeto do presente Contrato também abrange a montagem e instalação do(s) objeto (s) comprado pela "
                                }),
                                new TextRun({
                                    text: "CONTRATADA",
                                    bold: true
                                }),
                                new TextRun({
                                    text: ", nas condições especificadas a seguir:"
                                })
                            ],
                            spacing: {
                                before: 150,
                                after: 150
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Data do Evento: ",
                                    bold: true
                                }),
                                new TextRun({
                                    text: `${body.dataEvento}`
                                })
                            ]
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Horário da Montagem: ",
                                    bold: true
                                }),
                                new TextRun({
                                    text: `${body.horarioMontagem}`
                                })
                            ]
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Desmontagem: ",
                                    bold: true
                                }),
                                new TextRun({
                                    text: `${body.horarioEncerramento}`
                                })
                            ]
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Local do Evento: ",
                                    bold: true
                                }),
                                new TextRun({
                                    text: `${body.enderecoEvento}`
                                })
                            ]
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "CLÁUSULA 2 – DOS SERVIÇOS:",
                                    bold: true
                                })
                            ],
                            spacing: {
                                before: 150
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "2.1 – O "
                                }),
                                new TextRun({
                                    text: "CONTRATADO",
                                    bold: true
                                }),
                                new TextRun({
                                    text: " se compromete a realizar a entrega do item vendido ou alugado, no local e horário previamente indicados pelo "
                                }),
                                new TextRun({
                                    text: "CONTRATANTE",
                                    bold: true
                                }),
                                new TextRun({
                                    text: ". Em caso de eventuais atrasos no evento, a "
                                }),
                                new TextRun({
                                    text: "CONTRATADA",
                                    bold: true
                                }),
                                new TextRun({
                                    text: " se disponibiliza em estender seus serviços em no máximo 1 hora além do que está previsto em contrato;"
                                })
                            ]
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "2.2 – Caso na montagem o letreiro escolhido passe por alguma falha ou falta de funcionamento a "
                                }),
                                new TextRun({
                                    text: "CONTRATANTE",
                                    bold: true
                                }),
                                new TextRun({
                                    text: " entende que será necessário a substituição do mesmo, podendo ser alterado por outro disponível pelo "
                                }),
                                new TextRun({
                                    text: "CONTRATANTE",
                                    bold: true
                                }),
                                new TextRun({
                                    text: " no dia do evento."
                                }),
                            ]
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "CLÁUSULA 3 – DO PREÇO E PAGAMENTO:",
                                    bold: true
                                })
                            ],
                            spacing: {
                                before: 150
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "3.1 – A "
                                }),
                                new TextRun({
                                    text: "CONTRATANTE",
                                    bold: true
                                }),
                                new TextRun({
                                    text: " pagará ao "
                                }),
                                new TextRun({
                                    text: "CONTRATADO",
                                    bold: true
                                }),
                                new TextRun({
                                    text: " pelos serviços prestados e locações do Item descrito no Objeto deste contrato, o valor de: R$ "
                                }),
                                new TextRun({
                                    text: `${body.valorTotal}`
                                }),
                                new TextRun({
                                    text: " + Frete",
                                    bold: true
                                })
                            ]
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `3.2 – O pagamento será realizado via: ${body.formaPagamento}`
                                })
                            ],
                            spacing: {
                                after: 150
                            }
                        }),
                        new Paragraph({
                            text: "Nossos dados bancários:"
                        }),
                        new Paragraph({
                            text: "Banco: 336 - Banco C6 S.A."
                        }),
                        new Paragraph({
                            text: "Agência: 0001"
                        }),
                        new Paragraph({
                            text: "Conta corrente: 24676173-3"
                        }),
                        new Paragraph({
                            text: "CNPJ: 42.593.312/0001-04"
                        }),
                        new Paragraph({
                            text: "Nome: BLASQUES ASSESSORIA"
                        }),
                        new Paragraph({
                            text: "Chave Pix: 42.593.312/0001-04"
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "3.3 O contrato apenas será validado, após assinatura por ambas as partes, e o pagamento conforme combinado, enquanto o pagamento não for realizado e o contrato não for assinado, a data permanece em aberto, podendo ser repassada a outro cliente sem aviso prévio."
                                })
                            ],
                            spacing:{
                                before: 150
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "CLÁUSULA 4 – DAS OBRIGAÇÕES DA CONTRATANTE:",
                                    bold: true
                                })
                            ],
                            spacing: {
                                before: 150
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "4.1 – O CONTRATANTE compromete-se a: "
                                })
                            ]
                        }),
                        new Paragraph({
                            text: "a) Recomenda-se que a montagem ocorra em locais cobertos, pois a exposição à chuva pode resultar em danos aos equipamentos. A contratante assume total responsabilidade pelos danos causados aos itens contratados."
                        }),
                        new Paragraph({
                            text: "b) Arcar com despesas de estacionamento do CONTRATADO. Locais fechados como clubes, shoppings, buffets, etc., em que o estacionamento não for gratuito, o CONTRATANTE fica responsável pelo pagamento do estacionamento tanto para montagem como para desmontagem/retirada;"
                        }),
                        new Paragraph({
                            text: "c) Prover espaço adequado e condições mínimas (fonte de energia) para a instalação e fixação do Letreiro Luminoso;"
                        }),
                        new Paragraph({
                            text: "d) Após a realização de cada pagamento, o CONTRATANTE deverá informar e comprovar o ato ao CONTRATADO;"
                        }),
                        new Paragraph({
                            // text: "CLÁUSULA 5 – DA RESCISÃO CONTRATUAL:"
                            children: [
                                new TextRun({
                                    text: "CLÁUSULA 5 – DA RESCISÃO CONTRATUAL:",
                                    bold: true
                                })
                            ],
                            spacing: {
                                before: 150
                            }
                        }),
                        new Paragraph({
                            text: "5.1 - Terá findo este presente instrumento na data da efetivação do serviço contratado ou por inadimplemento ou por extinção antecipada, observada a seguintes condições:"
                        }),
                        new Paragraph({
                            text: "a) Caso o CONTRATANTE queira cancelar ou rescindir o contrato de serviços dentro de 24 horas após o pagamento, receberá um reembolso total, em até 7 dias úteis se o pagamento tenha sido feito via PIX, e em até 30 dias se o pagamento tenha sido feito via cartão de crédito (débito, vencimento ou parcelado)."
                        }),
                        new Paragraph({
                            text: "b) Caso o CONTRATANTE queira cancelar ou rescindir o contrato de serviços depois dos 7 dias após assinado o contrato, concorda que só tem direito a um reembolso de 70% da quantia total acordada para os bens e/ou serviços que você cancelou, abandonando assim qualquer direito a qualquer reembolso maior."
                        }),
                        new Paragraph({
                            text: "c) Caso o CONTRATANTE queira cancelar ou rescindir o contrato de serviços dentro de 60 dias antes do período de locação, concorda que só tem direito a um reembolso de 50% da quantia total acordada para os bens e/ou serviços que você cancelou, abandonando assim qualquer direito a qualquer reembolso maior."
                        }),
                        new Paragraph({
                            text: "d) Caso o CONTRATANTE queira cancelar ou rescindir o contrato de serviços dentro de 30 dias entes do período de locação, você concorda que não tem direito a qualquer reembolso de nós em relação a esses bens e/ou serviços e você perde e abandona qualquer direito a qualquer reembolso."
                        }),
                        new Paragraph({
                            text: "e) Caso houver desistência por parte do CONTRATADO, deverá devolver ao CONTRATANTE todo valor pago no ato da assinatura deste contrato, acrescidos de 30% do valor do contrato, como forma de multa por possíveis perdas por parte do CONTRATANTE."
                        }),
                        new Paragraph({
                            text: "f) Em caso de problema técnico causado por falta de energia, algum pane elétrico do local do evento, a qual não nos permita realizar nossos serviços, não haverá devolução de valores."
                        }),
                        new Paragraph({
                            // text: "CLÁUSULA 6 – ALTERAÇÃO DE DATA DO EVENTO:"
                            children: [
                                new TextRun({
                                    text: "CLÁUSULA 6 – ALTERAÇÃO DE DATA DO EVENTO:",
                                    bold: true
                                })
                            ],
                            spacing: {
                                before: 150
                            }
                        }),
                        new Paragraph({
                            text: "6.1 - Se por motivo de força maior e o CONTRATANTE solicitar alteração da data fixada, deverá informar ao CONTRATADO com antecedência mínima de 30 dias. Neste caso, desde que haja a disponibilidade do CONTRATADO, fica estipulada à CONTRATANTE, o pagamento de taxa de alteração no valor de 10% sobre o valor total estipulado neste instrumento;"
                        }),
                        new Paragraph({
                            text: "6.2 – Em caso de impossibilidade do CONTRATADO em realizar o evento em nova data, será considerada a rescisão contratual por parte da CONTRATANTE, conforme descrito na Cláusula 5 deste contrato;"
                        }),
                        new Paragraph({
                            // text: "CLÁUSULA 7 – DA CONCESSÃO DO USO DE IMAGEM: "
                            children: [
                                new TextRun({
                                    text: "CLÁUSULA 7 – DA CONCESSÃO DO USO DE IMAGEM: ",
                                    bold: true
                                })
                            ],
                            spacing:{
                                before: 150,
                            }
                        }),
                        new Paragraph({
                            text: "7.1 - Pelo presente instrumento particular e na melhor forma de direito, o (a) CONTRATANTE (A) autoriza a CONTRATADO, desde já, em caráter irretratável e irrevogável, a:"
                        }),
                        new Paragraph({
                            text: "a) Utilizar e veicular as fotografias realizadas com o registro da imagem do(a) CONTRATANTE(A) no em mídias sociais do CONTRATADO, para fins de publicidade institucional e/ou de produtos contratados, sem qualquer limitação de número de inserções e reproduções;"
                        }),
                        new Paragraph({
                            text: "b) Utilizar as fotografias na produção de quaisquer materiais publicitários e promocionais para fins de divulgação em mídias sociais do CONTRATADO, tais como, exemplificativamente, anúncios em revistas e jornais, folhetos, cartazetes, Instagram, Facebook “posters”, filmes publicitários, “out door” e “bus door”, dentre outros, a serem veiculados;"
                        }),
                        new Paragraph({
                            // text: "CLÁUSULA 8 – DISPOSIÇÕES GERAIS:"
                            children: [
                                new TextRun({
                                    text: "CLÁUSULA 8 – DISPOSIÇÕES GERAIS:",
                                    bold: true
                                })
                            ],
                            spacing: {
                                before: 150
                            }
                        }),
                        new Paragraph({
                            text: "8.1 – Define-se que:"
                        }),
                        new Paragraph({
                            text: "a) Após o recebimento deste contrato o cliente tem até a data estipulada para enviar o comprovante do pagamento da entrada, ou o mesmo pode ser cancelado e a data poderá ser disponibilizada para outro cliente."
                        }),
                        new Paragraph({
                            text: "b) Caso o contratante não realize o pagamento do restante até 30 dias corridos antes do evento, a reserva será cancelada sem aviso prévio e a data disponibilizada para novas locações."
                        }),
                        new Paragraph({
                            text: "c) Festas canceladas por motivos de morte de parentes de primeiro grau, doença do anfitrião ou de parentes de primeiro grau e/ou decretos governamentais (ex. Restrições por pandemia), o valor pago fica como crédito para um futuro evento, podendo ser marcado em até 6 meses desde que seja comunicado com até 30 dias de antecedência do evento."
                        }),
                        new Paragraph({
                            // text: "CLÁUSULA 9 - DANOS AOS EQUIPAMENTOS"
                            children: [
                                new TextRun({
                                    text: "CLÁUSULA 9 - DANOS AOS EQUIPAMENTOS",
                                    bold: true
                                })
                            ],
                             spacing: {
                                before: 150
                             }
                        }),
                        new Paragraph({
                            text: "Em caso de danos contra a estrutura dos Painéis, letreiros ou qualquer outro equipamento que compõem nossos serviços, causados por algum convidado, cabe reparo dos itens ao próprio convidado, ou em falta de pagamento do convidado, fica sob a responsabilidade do CONTRATANTE nos valores atuais do mercado."
                        }),
                        new Paragraph({
                            text: "Em caso de danos ao equipamento causado pelo nosso STAFF, fica ausentado a responsabilidade do reparo ao CONTRATANTE;"
                        }),
                        new Paragraph({
                            // text: "CLÁUSULA 10 – DO FORO"
                            children: [
                                new TextRun({
                                    text: "CLÁUSULA 10 – DO FORO",
                                    bold: true
                                })
                            ],
                            spacing: {
                                before: 150
                            }
                        }),
                        new Paragraph({
                            text: "10.1 – Elege o foro da comarca de São Paulo- SP para dirimir eventuais LITÍGIOS DECORRENTES DO PRESENTE termo de contrato, em duas vias de igual teor. Aplicam-se ao presente, todas as disposições relativas ao código de Defesa DO CONSUMIDOR (Lei 8078 de 11 de setembro de 1990), outras aplicáveis à espécie."
                        }),
                        new Paragraph({
                            // text: `São Paulo, ${dia} de ${mes} de ${ano}`
                            children: [
                                new TextRun({
                                    text: `São Paulo, ${dia} de ${mes} de ${ano}`
                                })
                            ],
                            spacing: {
                                before: 150,
                                after: 150
                            }
                        }),
                        // new Paragraph({
                        //     children: [
                        //         new ImageRun({
                        //             data: imagemAssinatura,
                        //             transformation: {
                        //                 width: 212,
                        //                 height: 196
                        //             }
                        //         })
                        //     ],
                        //     alignment: Alignment.LEFT
                        // })
                    ]
                }
            ]
        });

        const fileName = path.join(__dirname, ``);

        // Salvar o documento modificado
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(outputPath, buffer);
        console.log("Documento atualizado com sucesso:", outputPath);
    } catch (error) {
        console.error("Erro ao substituir campos:", error);
    }
}

// async function salvarDocumento(outputPath) {
//     const arquivoBuffer = fs.readFileSync(outputPath);
//     const documento = await Document.create({
//         nome: 'resultado_final.docx',
//         arquivo: arquivoBuffer
//     });
//     console.log('Documento salvo com sucesso:', documento.id);
// }

// async function createDocxFromHtml(html, outputPath) {
//     const paragraphs = html.split(/<\/?p[^>]*>/).filter(Boolean).map(p => {
//         return new Paragraph({
//             children: [
//                 new TextRun(p.replace(/<[^>]+>/g, '').trim()) // Remove tags HTML e espaços em branco
//             ]
//         });
//     });

//     const document = new Document({
//         creator: "Your Name", // Adicione um criador aqui
//         title: "Contrato Automatizado",
//         description: "Documento gerado automaticamente a partir de um template.",
//         sections: [{
//             properties: {},
//             children: paragraphs
//         }],
//     });

//     const buffer = await Packer.toBuffer(document);
//     fs.writeFileSync(outputPath, buffer);
// }

// async function salvarDocumento(outputPath) {
//     const arquivoBuffer = fs.readFileSync(outputPath);
//     const documento = new Document({
//         nome: 'resultado_final.docx',
//         arquivo: arquivoBuffer
//     });
//     console.log('Documento salvo com sucesso:', documento.id);
// }