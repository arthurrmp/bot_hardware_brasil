const chalk = require('chalk');
const notifier = require('node-notifier');
const path = require('path');
const opn = require('opn')
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const chromeOptions = {
    headless: true,
    defaultViewport: null,
    UserAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36`
};

async function getPrices() {
    const lojas = require('./data/lojas.json');
    const placas = require('./data/placas.json');
    const config = require('./data/config.json');

    const browser = await puppeteer.launch(chromeOptions);
    const page = await browser.newPage();

    console.log(' -------------------------------------------------------------------------------------')
    console.log(`| ${padding('HORA', 20)}|${padding('PLACA', 20)}|${padding('LOJA', 20)}|${padding(`PREÇO`, 20)} |`)
    console.log(' -------------------------------------------------------------------------------------')

    for (const loja of lojas) {
        for (const placa of placas) {
            try {
                await page.goto(loja.url + loja.query.replace('[MODELO_PLACA]', placa.modelo.replace(' ', '+')));
            } catch (error) {
                console.log(error);
            }

            await page.content();
            await page.setViewport({ width: 1920, height: 1080 });

            let produtos = [];

            const gpus = await page.evaluate((tag) => Array.from(document.querySelectorAll(tag), element => element.textContent), loja.productTag);
            const hrefs = await page.evaluate((tag) => Array.from(document.querySelectorAll(tag), element => element.getAttribute(`href`)), loja.productTag);
            const precos = await page.evaluate((tag) => Array.from(document.querySelectorAll(tag), element => element.textContent), loja.precoTag);

            // Tratamento temporário, pois a kabum mostra o preço até dos produtos esgotados :( 
            let disponibilidades;
            if (loja.id == 'kabum') {
                disponibilidades = await page.evaluate(() => Array.from(document.querySelectorAll('.sc-AxhCb.dghWOt > img'), element => element.getAttribute('src')));
            }

            for (let i = 0; i < gpus.length; i++) {
                if (precos[i] && !gpus[i].includes(loja.excludeIfContains)) {
                    const gpuFormat = gpus[i].replace(`\n`, ``);
                    let precoFormat = precos[i].match(/R\$.{0,10},\d{2}/g)[0].replace(`.`, ``).replace(`R$`, ``);
                    precoFormat = precoFormat.substring(0, precoFormat.lastIndexOf(',')).trim();

                    let disponibilidadeFormat;
                    if (loja.id === 'kabum') {
                        disponibilidadeFormat = !disponibilidades[i].includes('comprar_off');
                    } else {
                        disponibilidadeFormat = true;
                    }
                    produtos.push({ gpu: gpuFormat, href: hrefs[i], preco: precoFormat, disponivel: disponibilidadeFormat })
                }
            }
            for (const produto of produtos) {
                /* A verificação 'incluiTodaPalavra' é necessária para verificar se o produto encontrado é realmente o desejado,
                 pois os sites costumam incluir produtos que não são o buscado. Exemplo: Ao pesquisar RTX3070, também incluem a RTX 3080. */
                if (incluiTodaPalavra(produto.gpu, placa.modelo) && produto.disponivel) {
                    let dataHora = new Date();
                    let dataFormatada = `${dataHora.getDate()}-${dataHora.getMonth()}-${dataHora.getFullYear()} ${dataHora.getHours()}h${dataHora.getMinutes()}m`;
                    const dataFormatadaNew = dataFormatada.replace(/-/g, '/');

                    if (produto.preco <= placa.precoMax) {
                        const urlProduto = produto.href.startsWith('http') ? produto.href : loja.url + produto.href;
                        //console.log(`${dataFormatada.replace(/-/g, '/')} | ${placa.modelo} | ${loja.id} | ${chalk.green(`R$ ${produto.preco}`)}`);
                        console.log(`| ${padding(dataFormatadaNew, 20)}|${padding(placa.modelo, 20)}|${padding(loja.id, 20)}|${chalk.green(padding(`R$ ${produto.preco}`, 20))} |`)
                        try {
                            await page.goto(urlProduto);
                        } catch (error) {
                            console.log(error);
                        }
                        await delay(2000);

                        if (config.printarOferta) {
                            await page.screenshot({ path: 'screenshots/' + dataFormatada + ' - ' + produto.gpu + `.png` });
                        }

                        if (config.notificarOferta) {
                            notificar('Oferta Encontrada!', produto.preco, loja.id + ' - ' + produto.gpu, urlProduto);
                        }

                    } else {
                        //console.log(`${dataFormatada.replace(/-/g, '/')} | ${placa.modelo} | ${loja.id} | ${chalk.red(`R$ ${produto.preco}`)}`);
                        console.log(`| ${padding(dataFormatadaNew, 20)}|${padding(placa.modelo, 20)}|${padding(loja.id, 20)}|${chalk.red(padding(`R$ ${produto.preco}`, 20))} |`)
                    }
                }
            }
        }
    }
    await browser.close();
    console.log(' -------------------------------------------------------------------------------------')
    console.log(`Verificando preços novamente em ${config.verificarACada / 60000} minutos... `)
    await delay(config.verificarACada);
    getPrices();
}

const notificar = (title, preco, message, urlProduto) => {
    notifier.notify(
        {
            title: `${title} (R$ ${preco})`,
            message: message,
            icon: path.join(__dirname, 'icon.png'),
            sound: true,
        },
        function (err, response, metadata) {
            if (response == 'activate') {
                opn(urlProduto);
            }
        }
    );
}

function padding(column, lenMax) {
    if (column.length <= lenMax) {
        const lenString = lenMax - column.length;
        let aStart = '';
        aStart = aStart.padStart(lenString / 2, ' ');
        let aEnd = aStart;
        if (aStart.length + aEnd.length + column.length !== lenMax) {
            aEnd = ' ' + aEnd;
        }
        return (`${aStart}${column}${aEnd}`)
    }
}

function incluiTodaPalavra(stringASerPesquisada, stringsParaPesquisar) {

    const arrayPesquisaStrings = stringsParaPesquisar.split(' ');

    for (const pesquisa of arrayPesquisaStrings) {
        if (!stringASerPesquisada.includes(pesquisa)) {
            return false;
        }
    }
    return true;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

getPrices();