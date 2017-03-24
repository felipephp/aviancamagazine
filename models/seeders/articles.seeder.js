var faker = require('../../lib/faker');

module.exports = {
	seed: function(qtt, cfg){

		if (!qtt) { qtt = 1 }
		var fakes = [];

		while(qtt > 0){
			var reg = {};

			var rand_cat_id 		= faker.random.number({max: cfg.categories.max, min: cfg.categories.min });
			var rand_edt_id 		= faker.random.number({max: cfg.editions.max, min: cfg.editions.min });
			var rand_ath_id 		= faker.random.number({max: cfg.authors.max, min: cfg.authors.min });

			reg.title 				= faker.lorem.word();
			reg.slug 				= faker.lorem.slug();
			reg.content 			= faker.lorem.paragraphs();
			reg.categorie_id 		= rand_cat_id;
			reg.edition_id 			= rand_edt_id;
			reg.author_id			= rand_ath_id;

			fakes.push(reg);
			qtt--;
		}
		
		//console.log('gen::', fakes);
		return fakes;

	}
}