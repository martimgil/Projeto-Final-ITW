Projeto Final - ITW - Paris 2024

Elaborado por: Martim Gil e Daniel Duque

-------------------------------------------------


index.html - Foi adicionado uma timeline que mostra os últimos eventos dos jogos olímpicos. Ao Medalheiro ja existente foi adicionado um gráfico usando ChartJS que representa a informação presente na tabela

quiz.html - Foram criados 3 Quizes com perguntas sobre os jogos olímpicos.

medalheiro.html - Medalheiro Por Pais - Foi adicionado um gráfico usando ChartJS que representa a informação presente na tabela.

Todas as páginas que tem a opção de adicionar um item aos favoritos (modalidades, atletas, treinadores etc) é possível fazer a gestão diretamente na tabela (e não apenas na páginas dos favoritos como tinhamos na apresentação). O icon ficara vermelho se encontrar-se nos favoritos, e ao clicar novamente no botão o item fica preto e é removido dos favoritos.

Foi adicionado a página de listagem completa para todos os 6 torneios disponíveis na API. De forma a apresentação a tabela com alguma informação, são usadas 3 API's em simultaneo diferentes para obter a informação necessária. Apesar de todas as otimizações de eficácia feitas pode demorar um pouco mais que as outra a carregar a informação,dependendo do número de eventos que cada uma comporta. A mais longa é a do Atletismo e deverá demorar em média menos de 2 minutos a carregar toda a informação. Foi criado para cada tabela é um sistema de paginação de forma a não sobrecarregar o utilizador e o servidor com demasiada informação de uma só vez. Cada linha da tabela tem a sua opção de ir para a sua página de detalhes e a opção de adicionar aos favoritos. Também foi adicionado um sistema de filtrar por Evento, por Stage ou ambos em simultaneo, e a tabela é atualizada dinamicamente com essa informação.

Foi adicionado uma listagem para as nacionalidades.

Foi adicionado uma listagem para as medalhas atribuídas a atletas. Inclui um sistema que reencaminha para os detalhes do atleta, adicionar aquele atleta aos favoritos e foi feita uma caixa de pesquisa por modalidade que apresenta os atletas que ganharam medalhas nessa modalidade.

Foi criado uma página para o TOP 25 Atletas com mais medalhas. é apresentado um gráfico com as medalhas desses atletas, e foi criado um sistema de filtragem para escolher ver apenas o ouro, prata, bronze ou todas.

A navbar em todas as páginas foi atualizada para incluir todas as páginas que foram adicionadas.

A página central dos favoritos foi atualizada para incluir todos os novos favoritos.

Foi aumentado o tamanho dos pins no mapa do percurso da tocha olímpica.
