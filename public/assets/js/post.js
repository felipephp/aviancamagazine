$(document).ready(function () {
    post.init();
});

post = {
    isAnotherPost: false,

    regions: {
        // article_title: { required: true },
        article_content: { required: true },
    },

    content_default: null,
    title_default: 'O Título do Novo Post',

    init: function () {
        Script.store(this, 'regions');
        ContentToolsExtensions.editor._ignition.requiredRegions = post.requiredRegions;

        //Se não for edição. Definir conteudo defualt de RESET da tela
        if (Script.screenJson.id == undefined) {
            this.content_default = $('[data-name="article_content"]').html();
            this.title_default = $('[data-name="article_title"]').html();
            this.setDefaultNewPost();
        }
    },

    setDefaultNewPost: function () {
        $('[data-name="article_title"]').html(this.title_default);
        $('[data-name="article_content"]').html(this.content_default);
    },

    /*
     * Funções executada no ONSAVE do ContentTools dinamicamente para salvar o post da cidade.
     * */
    create: function (ev)
    {
        ContentToolsExtensions.mountRegions(ev.detail().regions, post.regions);
        //this.mountRegions(ev.detail().regions);
        post.action('create', ev);
    },
    update: function (ev)
    {
        ContentToolsExtensions.mountRegions(ev.detail().regions, post.regions);
        post.action('update', ev);
    },

    action: function (action, ev)
    {
        // alert("here");
        // if (action == 'create') {
            if (!ContentToolsExtensions.validateRegions(post.regions)) {
                return false;
            }
        // }
        //console.log('Theend...', ImageUploader.DATA);
        //return false;

        if (ev.detail().regions == null) {
            swal('Nenhuma alteração', 'Ok, nada foi alterado.', 'warning');
        }else{
            ImageUploader.DATA.submit();
                return;
            $.ajax({
                method: 'post',
                data: { regions: post.regions, images: ImageUploader.DATA, id: Script.screenJson.id, action: action },
                dataType: 'json',
                // contentType: false,
                processData: false,
                success: function (data) {
                    post.confirm(data.message, data)
                },
                error: function (e) {
                    post.confirm('error')
                }
            });
        }

        this.regions = Script.restore('regions');
    },

    confirm: function (action, data)
    {
        var obj;
        switch (action)
        {
            case 'create':
                obj = {
                    // title: 'Post da cidade criado com sucesso',
                    title: 'Post criado com sucesso!',
                    text: 'Por padrão, este post ainda não está sendo exibido no site. É necessário configurar algumas coisas antes como: Tags, Autor, status e etc. Deseja fazer isso agora?',
                    type: "success",
                    showCancelButton: true,
                    confirmButtonColor: '#a5dc86',
                    confirmButtonText: 'Configurar este post',
                    cancelButtonText: 'Criar novo',
                    closeOnConfirm: false,
                    closeOnCancel: true
                };
                break;

            case 'update':
                if (data.edited) {
                    obj = {
                        title: 'Post alterado com sucesso',
                        type: "success",
                        confirmButtonColor: '#a5dc86',
                        confirmButtonText: 'Legal!',
                        closeOnConfirm: true
                    };
                }else{
                    obj = {
                        title: '',
                        text: 'Nenhum erro, nenhuma alteração.',
                        type: "info",
                        confirmButtonColor: '#a5dc86',
                        confirmButtonText: 'fechar',
                        closeOnConfirm: true
                    };
                }
                break;

            case 'none':
                obj = {
                    // title: 'Post da cidade criado com sucesso',
                    title: '',
                    text: 'Não houve nenhuma alteração.',
                    type: "warning"
                };
                break;

            case 'error':
                obj = {
                    title: 'Ops, Houve um erro!',
                    text: 'Tente novamente, se o erro persistir, entre em contato com o administrador do sistema.',
                    type: "error",
                    confirmButtonColor: '#2980b9',
                    confirmButtonText: 'ok',
                    closeOnConfirm: true
                };
                break;
        }
console.log('OBJ::', obj);
        swal
        (
            obj,
            function(isConfirm){
                if (action == 'create')
                {
                    if (isConfirm)
                    {
                        window.location.href='/painel/blog/post/'+data.post_id;
                    }
                    else
                    {
                        //Reset view para NOVO POST
                        post.setDefaultNewPost();
                    }
                }
            }
        );
    }
};