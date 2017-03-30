$(document).ready(function(){
	home.init();
});

home = {
	init: function(){
	    __this = this;
		// this.negocios.init();
		//this.vue();
        this.vue = new Vue({
            _this: this,
            el: "#app",
            data: {
                // negocios: {materias: [], active_sub: "", subcategorias: subcategorias_negocios},
                // life_style: {materias: [], active_sub: "", subcategorias: subcategorias_life_style},
                lifeStyle: { materias: [], subcategorias: __this.lifeStyle.categories, active_sub: "" },
                negocios: { materias: [], subcategorias: __this.negocios.categories, active_sub: "" }
            },
            mounted: function() {
                console.log("ready");
                this.getByCategory("negocios", 4, 2);
                this.getByCategory("lifeStyle", 3, 4);
                // this.getByCategory("life_style", "589bbdfeebbd1068f49c0611");
            },
            methods: {
                getByCategory: function (key, id, limit) {
                    if (!limit) { limit = 4; }
                    var self = this;

                    $.ajax({
                        method: 'post',
                        data: { id: id, limit: limit },
                        url: "/api/categorias/materias",
                        success: function(data) {

                            __this.setupPosts(data.results);

                            self[key].materias = data.results;
                            self[key].active_sub = "";
                        }
                    })
                },

                getBySub: function (key, id, limit) {
                    // _this = this;
                    if (!limit) { limit = 4; }
                    var self = this;

                    $.ajax({
                        method: 'post',
                        data: { id: id, limit: limit },
                        url: "/api/subcategorias/materias",
                        success: function(data) {

                            __this.setupPosts(data.results);

                            self[key].materias = data.results;
                            self[key].active_sub = id;
                        }
                    })
                }
            }
        })
	},

    setupPosts: function (posts)
    {
        for (var idx in posts)
        {
            var post = posts[idx];

            post.showContent    = ( post.headline_content ) ? post.headline_content : post.content;
            post.showTitle      = ( post.headline_title ) ? post.headline_title : post.title;
            post.showImage      = ( post.headline_img_path ) ? post.headline_img_path : post.main_img_path;
            var sentence = post.showContent.replace(/(<([^>]+)>)/ig,"");

            post.showContent = home.findSentenceEnd(sentence)+'...';
        }
    },

    findSentenceEnd: function(sentence, end) {
        if (end == undefined) { end = 220; }

        var testText = sentence;
        testText = testText.replace(/(<([^>]+)>)/ig,"").slice(0,end);

        //If the string is less than "end" var, return without managing.
        if ( !testText[end-1] ) { return testText; }

        if (testText[end-1] != ' ') {
            return this.findSentenceEnd(sentence, (end+1) );
        }else{
            return testText.slice(0, (end-1) );
        }

    },

	negocios: {
	    id: 4,
	},

    lifeStyle: {

    }
};