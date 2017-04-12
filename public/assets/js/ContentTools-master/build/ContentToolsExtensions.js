/*
* TODO
*
* Criar um form vazio
* Qdo clicar em upload, criar input dinamico e selecionar arquivo
*  -> Se cancelar, deletar este input, definir um id para isso.
*
* Ao final, colar regions dentro deste form também e enviar tudo via post.
* */

$(document).ready(function () {
    ContentTools.Event('beforeSave', {});
    ContentTools.StylePalette.add(
        [
            new ContentTools.Style('By-line', 'article__by-line'),
            new ContentTools.Style('Caption', 'article__caption', ['p']),
            new ContentTools.Style('Example', 'example', ['pre']),
            new ContentTools.Style('Example + Good', 'example--good', ['pre']),
            new ContentTools.Style('Example + Bad', 'example--bad', ['pre'])
        ]
    );

    ContentToolsExtensions.init();

    // Disable refresh message
    window.removeEventListener('beforeunload', ContentToolsExtensions.editor._handleBeforeUnload);
});

ImageUploader = (function() {
    ImageUploader.imagePath = 'image.png';

    ImageUploader.imageSize = [600, 174];

    function ImageUploader(dialog) {
        this._dialog = dialog;
        this._dialog.addEventListener('cancel', (function(_this) {
            return function() {
                return _this._onCancel();
            };
        })(this));
        this._dialog.addEventListener('imageuploader.cancelupload', (function(_this) {
            return function() {
                return _this._onCancelUpload();
            };
        })(this));
        this._dialog.addEventListener('imageuploader.clear', (function(_this) {
            return function() {
                return _this._onClear();
            };
        })(this));
        this._dialog.addEventListener('imageuploader.fileready', (function(_this) {
            return function(ev) {
                return _this._onFileReady(ev.detail().file);
            };
        })(this));
        this._dialog.addEventListener('imageuploader.mount', (function(_this) {
            return function() {
                return _this._onMount();
            };
        })(this));
        this._dialog.addEventListener('imageuploader.save', (function(_this) {
            return function() {
                return _this._onSave();
            };
        })(this));
        this._dialog.addEventListener('imageuploader.unmount', (function(_this) {
            return function() {
                return _this._onUnmount();
            };
        })(this));
    }

    ImageUploader.prototype._onCancel = function() {};

    ImageUploader.prototype._onCancelUpload = function() {
        clearTimeout(this._uploadingTimeout);
        return this._dialog.state('empty');
    };

    ImageUploader.prototype._onClear = function() {
        return this._dialog.clear();
    };

    ImageUploader.prototype._onFileReady = function(file) {
        var upload;
        console.log(file);

        var ipt = document.createElement('input');
        ipt.setAttribute('type','file');
        ipt.setAttribute('name','image['+Random()+']');
        ipt.files[0] = file;
        ImageUploader.DATA.appendChild(ipt);
        //ImageUploader.DATA.append('image_'+Random(), file);

        this._dialog.progress(0);
        this._dialog.state('uploading');
        upload = (function(_this) {
            return function() {
                var progress;
                progress = _this._dialog.progress();
                progress += 1;
                if (progress <= 100) {
                    _this._dialog.progress(progress);
                    return _this._uploadingTimeout = setTimeout(upload, 25);
                } else {
                    var reader = new FileReader();
                    reader.readAsDataURL(file);

                    return reader.onload=function(f)
                    {
                        ImageUploader.imagePath = f.target.result;
                        return _this._dialog.populate(ImageUploader.imagePath, ImageUploader.imageSize);
                    };
                }
            };
        })(this);
        return this._uploadingTimeout = setTimeout(upload, 25);
    };

    ImageUploader.prototype._onMount = function() {
        var e = document.getElementsByClassName('ct-image-dialog__file-upload')[0];
        var parent = e.parentNode;

        var i2 = document.createElement('input');
        i2.setAttribute('name','img');
        i2.setAttribute('type','file');
        i2.setAttribute('id','gamb');

        i2.onchange=function () {
            console.log('i2, ', {e:this});
        };

        var nform = document.createElement('form');
        nform.setAttribute('enctype', 'multipart/form-data');
        nform.appendChild(i2);

        parent.appendChild(nform);

        e.addEventListener('click', function (ev) {
            //ev.preventDefault();
            //i2.click();

            // var input = document.getElementById('gamb');
            // input.click();
            //console.log('changed', {e:this.files[0]});
            // die
        });
    };


    ImageUploader.prototype._onSave = function() {
        var clearBusy;
        this._dialog.busy(true);
        clearBusy = (function(_this) {
            return function() {
                _this._dialog.busy(false);
                return _this._dialog.save(ImageUploader.imagePath, ImageUploader.imageSize, {
                    alt: 'Example of bad variable names'
                });
            };
        })(this);
        return setTimeout(clearBusy, 1500);
    };

    ImageUploader.prototype._onUnmount = function() {};

    ImageUploader.createImageUploader = function(dialog) {
        return new ImageUploader(dialog);
    };

    return ImageUploader;

})();

function Random(end, start)
{
    if ( start == undefined ) { start = 1; }
    if ( end == undefined ) { end = 100; }

    return Math.floor(Math.random() * end) + start;
}

ContentToolsExtensions = {

    init: function () {

        var f = document.createElement('form');
        f.setAttribute('method','post');
        f.setAttribute('enctype','multipart/form-data');
        f.setAttribute('action', '/dev/materia/upload-image');

        ImageUploader.DATA = f;

        document.body.appendChild(ImageUploader.DATA);

        ContentTools.IMAGE_UPLOADER = ImageUploader.createImageUploader;
        // ContentTools.IMAGE_UPLOADER = upper;

        //Configurar editor
        this.editor = ContentTools.EditorApp.get();
        this.editor.init('[data-editable], [data-fixture]', 'data-name');

        this.editor.addEventListener('saved', function(ev) {
            eval(Script.screenJson['contentToolsOnSave']+"(ev)");
        });

        /*Para elementos ditos como fixos*/
        FIXTURE_TOOLS = [['undo', 'redo']];
        ContentEdit.Root.get().bind('focus', function(element) {
            var tools;
            if (element.isFixed()) {
                tools = FIXTURE_TOOLS;
            } else {
                tools = ContentTools.DEFAULT_TOOLS;
            }
            if (ContentToolsExtensions.editor.toolbox().tools() !== tools) {
                return ContentToolsExtensions.editor.toolbox().tools(tools);
            }
        });
    },

    mountRegions: function (evregions, objregions)
    {
        //Pegar regioes alteradas, salvar no objeto final e validar se for required.
        for (var regionName in evregions)
        {
            if (evregions.hasOwnProperty(regionName))
            {
                if (objregions[regionName] == undefined) { objregions[regionName] = {}; }
                objregions[regionName].content = evregions[regionName];
                if (objregions[regionName].required)
                {
                    objregions[regionName].validated = true;
                }
            }
        }
    },

    validateRegions: function (objregions) {
        var hasError = false;

        var regionsErrors = '';
        var errorsCount = 0;

        //Ler objeto final e validar as configurações
        for(var region in objregions)
        {
            if (objregions.hasOwnProperty(region))
            {
                var cfg = objregions[region];
                if (cfg.required && !cfg.validated)
                {
                    regionsErrors += ( regionsErrors == '' ) ? '"'+region+'"' : ', "'+region+'"';
                    errorsCount = errorsCount+1;
                    hasError = true;
                }
            }
        }

        if (hasError) {
            var texts = { 1: '', 2: '' };
            switch (errorsCount)
            {
                //Singular
                case 1:
                    texts[1] = 'Região';
                    texts[2] = 'é obrigatória';
                    break;

                //Plural
                default:
                    texts[1] = 'Regiões';
                    texts[2] = 'são obrigatórias';
                    break;
            }
            swal('Ops, Nada foi salvo!', texts[1]+' ['+regionsErrors+'] '+texts[2]+'. Em caso de dúvidas, entre em contato com o administrador', 'error');
            return false;
        }

        return true;
    },
};