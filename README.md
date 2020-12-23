# Bot Hardware Brasil

Um crawler criado para ajudar a economizar monitorando os preços de determinados produtos nos sites mais famosos de hardware do Brasil. Primariamente criado para as novas placas da NVIDIA mas funcional para qualquer produto de interesse do usuário. Atualmente suporta KaBuM!, Pichau e Terabyteshop.

Criado usando Node.JS e Puppeteer, simula um usuário comum para os sites, obtém os dados de produtos e preços e os compara com o desejado pelo usuário.

![Foto que mostra vários resultados de preços de placa de vídeo](https://i.imgur.com/sF6Tn85.png)
<p>Formato dos dados mostrados no terminal. Em verde, um preço abaixo do determinado pelo usuário no arquivo <i>data/placas.json</i></p>

O usuário pode escolher para receber uma notificação do seu sistema operacional:

![Foto que mostra notificação avisando que uma oferta foi encontrada](https://i.imgur.com/d6eZRNk.jpg)
<p>Ao clicar na notificação, o usuário será redirecionado para o link da oferta.</p>

E o bot também pode armazenar um print da oferta:

![Foto que mostra um screenshot da oferta no site da loja](https://i.imgur.com/u6ER667.png)
<p>Wow, que barato! 😐</p>

# Configuração

• Clone o repositório.<br><br>
• Configurações do funcionamento estão definidas em <i>data/config.json</i>. (Criar screenshot? Criar Notificação? Verificar a quantos ms?). <br><br>
• Configurações dos produtos e seus preços estão definidos em <i>data/placas.json</i>. (Contidos três RTX, de exemplo). <br>
Para ver o bot notificando, é provável que você tenha que aumentar os preços definidos nesse arquivo.<br><br>
• <i>npm install</i> <br><br>
• <i>npm start</i> <br><br>
