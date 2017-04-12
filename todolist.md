mysql pass do: Elipse#1126
7[F5#4(9EV1W3G7
>## 26/03

    >[#hard 1] Finalizar conversão do DB mongo / digitalocean
    >[#medium 2] HTML da revista no topo
    >Todos os EASY

>## 27/03
    >[#Medium 1] Reescrever queries do site
    
>## 28/03 - 29/03 
    >[#Hard 2] Reescrever queries do painel

>## 30/03 - 31/03
    >[#Hard 4] Galeria de fotos
    
### --------------------------------------------------------------------------------

#### Hard
-[x] <span style="color: green; font-weight: bold">[ OK ]</span> Finalizar conversão do DB mongo/mysql
-[x] Reescrever queries do painel
-[x] Reescrever queries do site e ajustes de rotas (inserir prefix materias/)
-[ ] <span style="color: orange; font-weight: bold">[ Layout ]</span>Galeria com LEGENDA

#### Medium
-[x] <span style="color: green; font-weight: bold">[ OK ]</span> HTML da revista no topo
-[ ] <span style="color: orange; font-weight: bold">[ Layout ]</span>colocar o prêmio da revista e logo 
-[x] <span style="color: orange; font-weight: bold">[ Layout ]</span>No item de compartilhar, colocar o texto "gostou do nosso conteúdo? compartilhe "
-[ ] Prêmios com fundo transparente, 4º avião

#### Easy
-[x] <span style="color: green; font-weight: bold">[ OK ]</span> remover LOVE 
-[x] <span style="color: green; font-weight: bold">[ OK ]</span>remover icones redes sociais 
-[x] <span style="color: green; font-weight: bold">[ OK ]</span>remover horários 
-[x] <span style="color: green; font-weight: bold">[ OK ]</span> Adicionar template HTML de comentários
-[ ] <span style="color: orange; font-weight: bold">[ Layout ]</span> Mudar o Banner escrever; ( clique aqui e envie sua foto )
-[x] <span style="color: green; font-weight: bold">[ OK ]</span>Retirar lojas Avianca 
-[x] <span style="color: green; font-weight: bold">[ OK ]</span>Colocar um item Avianca ( Quem é Avianca, prêmios, contatos, WiFi)
-[x] <span style="color: green; font-weight: bold">[ OK ]</span>Retirar as redes sociais da parte superior
-[x] Quando mudar para mysql, listar notícias por available_At dentro da single de categoria
 
 #### PÓS
-[ ] <span style="color: orange; font-weight: bold">[ Layout ]</span> Galerias internas- colocar um campo de nome em cada foto para cadastrar o fotografo
-[ ] Galerias dentro do texto (ContentTools?) e liberar links dentro do post
-[x] Social  -> converter para mysql
-[ ] Converter usuários para Mysql e verificar segurança da senha
-[x] Ajustes de segurança em WHERE e ORDER by enviando valores via ? e arrayValues (2 dias)
-[ ] Ao buscar por slugs, podemos futuramente perder o link, então, tratar slug apenas para SEO e enviar tbm o ID da materia/cat/subcat para URL
-[ ] Aspas de chamada[NOVO]
-[ ] Redirecionar rotas inexistentes ou com erro para 404, para evitar queda de sistema.
-[ ] Autores - revisar parte de upload de fotos para reutilizar função, revisar forma de salvar a foto original, tem muita coisa lá.

-[ ] Restringir chave de API google maps para o dominio, quando estiver funcionando
-[ ] No slider, ainda aparece "OF". e só muda para 3 of 3 qdo clica, no início é 1/14.
-[ ] Welove e social galeria SHORTCODES (lembrar do share por foto em welove)[NOVO]
-[ ] Issu par todas as revistas

LAYOUTS
-[x] Menu avianca, post_template_one (todos) - sem sidebar - Usar accordion ou jquery tabs para todos os conteudos[NOVO] Texto quem somos + premios + aeronaves
-[x] ajustar TAGS na materia e na página para filtrar por tags 
-[x] Guia e mapa de rotas: Imagem grande, sem conteúdo (apenas click) category_style_six[NOVO]
-[x] welove backend
-[x] Edições anteriores / Nossas capas 
-[x] botao anuncie depois do welove
-[x] pesquisa (controller e página do site)
-[x] pagina de anuncie será contat_one MIDIA KIT[NOVO]
-[x] qdo clicar na revista, embed do issu no site[NOVO]
-[x] menu avianca... quem somos, carol, mapa de rotas (img)
-[x] Faltou fazer upload de SLUG das tags, colocar isso no script e atualizar tag por tag para recriar slugs
-[x] Embed do issuu, Ok, mas, e as outras? Vai cadastrar via banco?
-[x] converter corretamente o db novo, we love, social. manter entretenimento do jeito que está

-[x] localizações
-[x] tags
-[ ] configurar form anuncie
-[ ] videos
-[ ] arrumar menu mobile
-[ ] arrumar mega menu lateral
-[ ] config_videos inutilizada, deletar.
-[ ] required nao funciona no safari (autor, imagem, categoria)
-[ ] Tratar erro de max upload file size
-[ ] Bloquear botão de enviar após enviar
-[ ] Requisição ajax de criação de autor, tags, localizações, categoria

News
-[ ] Existe um bug em findArticle na materia.routes. Esta lenda a mesma materia duas vezes apenas por causa do show info, verificar como resolver.
-[ ] on create ou update de noticia, voltar para ela mesma, nao para listagem