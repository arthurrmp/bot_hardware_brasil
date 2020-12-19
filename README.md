# Bot RTX Brasil

Um crawler criado para ajudar a economizar que monitore os preços de determinados produtos nos sites mais famosos de hardware do Brasil. Primariamente criado para as novas placas da NVIDIA mas funcional para qualquer produto de interesse do usuário.

Criado usando Node.JS e Puppeteer, simula um usuário comum para os sites, obtém os dados de produtos e preços e os compara com o desejado pelo usuário.

O usuário pode escolher para receber uma notificação do seu sistema operacional:

![Foto que mostra notificação avisando que uma oferta foi encontrada](https://i.imgur.com/d6eZRNk.jpg)

E o bot também pode armazenar um print da oferta:

![Foto que mostra um screenshot da oferta no site da loja](https://i.imgur.com/m9Qpgwm.png)
<p>Wow, que barato!</p>

# Configuração

• Clone o repositório.<br>
• Configurações do funcionamento estão definidas em <i>data/config.json</i>. (Criar screenshot? Criar Notificação? Verificar a quantos ms?). <br>
• Configurações dos produtos e seus preços estão definidos em <i>data/placas.json</i>. (Contidas as três RTX, de exemplo). Como os preços estão abaixo do mercado atualmente, para ver o bot notificando, é provável que você tenha que aumentar os preços definidos nesse arquivo.<br>
• <i>npm install</i> <br>
• <i>npm start</i> <br>
