$(document).ready(function() {
	Script.init();
});

Script = {
    stored: {},
    pageScript: [],
    submitValidator: false,
    clickToEnable: {},
    screenJson: {},

    //Iniciar funções em comum entre "painel" e "site"
	init: function () {

    },

    store: function (obj, itemName)
    {
        if ( typeof obj[itemName] != 'object' ) {
            console.error(itemName+' não existe para ser armazendo');
            return false;
        }

        if ( this.stored[itemName] != undefined ) {
            console.error(itemName+' já existe. Verifique se existe outro script que executa o store do mesmo nome.');
            return false;
        }

        this.stored[itemName] = $.extend(true, {}, obj[itemName]);
        return true;
    },

    restore: function (name)
    {
        //return a new copy of copy withou alters
        return $.extend(true, {}, this.stored[name]);
    },

    unable: function (text) {
        if (text == undefined) {
            text = 'Função indisponível. Entre em contato com o administrador.';
        }

        swal({
            title: '',
            text: text,
            type: 'error'
        });
    },

    handleFileSelect: function(e, id)
    {
        //parent = document.getElementById(parent);
        Script.parent = e.parentNode;

        var files = e.files; // FileList object
        var f = files[0];

        //Se não for imagem, sair!
        if(f.type.search("image") < 0){ return false; }

        var reader = new FileReader();
        reader.readAsDataURL(f);

        reader.onload=function(f)
        {
            //Preload da imagem
            Script.foto = new Image();
            Script.foto.src = f.target.result;

            //Timeout para carregar e pegar dimensões da imagem
            tm = setTimeout(function(){ Script.getImgSize(id); },1);
        }
    },

    getImgSize: function(id)
    {
        var w = Script.foto.width;

        if (w == 0)
        {
            tm = setTimeout(function(){ Script.getImgSize(); },1000);
        }
        else
        {
            Script.foto.style.maxHeight="300px";

            var defaultimg = document.getElementById(id);
            var img = defaultimg.getElementsByTagName("img")[0];

            defaultimg.removeChild(img);

            defaultimg.appendChild(Script.foto);
            clearTimeout(tm);
        }
    },

    createForm: function (elements, paramns)
    {
        var form = this.createElement('form', paramns);
        //elements['_token'] = window.Laravel.csrfToken;

        /*
         * es: Objeto javascript { name: value }
         * prefix: Se es.value = Object, cairá em RECURSIVIDADE até encontrar um VALUE que seja STRING, então neste caso, NAME
         * será o prefixo para evitar sobreposição de INPUT NAME, caso vários objetos tenham o mesmo name
         * */
        (function createInput(es, prefix) {
            for(var attr in es)
            {
                if(typeof es[attr] != 'object'){
                    var input = document.createElement('input');
                    var value = es[attr];
                    input.type = 'text';
                    input.name = (prefix == undefined) ? attr : prefix+'['+attr+']';
                    input.value = value;
                    form.appendChild(input);
                }else{
                    var obj = es[attr];
                    if (prefix != undefined) {
                        //attr = prefix+"_"+attr;
                        attr = prefix+"["+attr+"]";
                    }
                    createInput(obj, attr);
                }
            }
        })(elements);

        form.style.display="none";
        document.body.appendChild(form);

        return form;
        //form.submit();
    },

    createElement: function (element, innerHTML, attrs, styles)
    {
        if (typeof innerHTML == 'object') {
            attrs = innerHTML;
            innerHTML = '';
        }

        if (typeof attrs    != 'object' ) { attrs = {} }
        if (typeof styles   != 'object' ) { styles = {} }

        var e = document.createElement(element);
        e.innerHTML = innerHTML;

        for(attr in attrs)
        {
            if (attr == 'onclick' && typeof attrs[attr] == 'function') {
                e.addEventListener('click', function (ev) {
                    return ev;
                }(attrs[attr]))
            }else{
                e.setAttribute(attr, attrs[attr]);
            }
        }

        for(css in styles)
        {
            e.style[css] = styles[css];
        }

        return e;
    },

    Random: function (end, start)
    {
        if ( start == undefined ) { start = 1; }
        if ( end == undefined ) { end = 100; }

        return Math.floor(Math.random() * end) + start;
    },

    anchorScroll: function (id)
    {
        var tag = $(id);
        $('html,body').animate({scrollTop: tag.offset().top}, 1300);
    }
};