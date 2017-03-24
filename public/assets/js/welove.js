$(document).ready(function(){
	welove.init();
});

welove = {
	init: function(){
		this.set();
		this.cfgPhoto();
		this.cfgSubmit();
	},

	set: function(){
		this.form 		= document.forms.welove;
		this.inputFile 	= this.form.imagem;
		console.log(this.inputFile);
		this.fotoSrc 	= document.getElementById('foto-src');
	},

	cfgPhoto: function(){
		this.inputFile.onchange=function(){
			var foto = Avianca.handleFileSelect(this, function(result){
				welove.fotoSrc.style.backgroundImage = 'url('+result+')';
				welove.form.imgLoaded = true;
			});
		}

		this.fotoSrc.onclick=function(){
			welove.inputFile.click();
		}
	},

	cfgSubmit: function()
	{
		this.form.onsubmit=function(e){
			if (!this.imgLoaded) {
				e.preventDefault();
				swal('Ops!','Favor selecionar a foto.');
			}
		}
	}
}