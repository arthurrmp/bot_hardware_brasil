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
    for (const loja of lojas) {
        for (const placa of placas) {
            await page.goto(loja.url + loja.query.replace('[MODELO_PLACA]', placa.modelo.replace(' ', '+')));
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
                if (produto.gpu.includes(placa.modelo) && produto.disponivel) {
                    if (produto.preco <= placa.precoMax) {
                        const urlProduto = produto.href.startsWith('http') ? produto.href : loja.url + produto.href;
                        console.log(`Oferta Encontrada na ${loja.id}! ${produto.gpu} por ${produto.preco}. ${urlProduto}`);
                        await page.goto(urlProduto);
                        await delay(2000);

                        if (config.printarOferta) {
                            let dataHora = new Date();
                            let dataFormatada = `${dataHora.getDate()}-${dataHora.getMonth()}-${dataHora.getFullYear()}-${dataHora.getHours()}h-${dataHora.getMinutes()}m - `
                            await page.screenshot({ path: 'screenshots/' + dataFormatada + produto.gpu + `.png` });
                        }

                        if (config.notificarOferta) {
                            notificar('Oferta Encontrada!', produto.preco, loja.id + ' - ' + produto.gpu, urlProduto);
                        }

                    } else {
                        console.log(`${placa.modelo} encontrada ${loja.id}, mas acima do preço 😢 (R$ ${produto.preco})`)
                    }
                }
            }
        }
    }
    await browser.close();
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

const delay = ms => new Promise(res => setTimeout(res, ms));

getPrices();