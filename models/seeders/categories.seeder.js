var faker = require('../../lib/faker');

module.exports = {
	seed: function(qtt){

		if (!qtt) { qtt = 1 }
		var fakes = [];

		while(qtt >= 0){
			var reg = {};

			reg.name 				= faker.lorem.word();
			reg.slug 				= faker.lorem.word();
			reg.menu_fixed 			= false;
			reg.menu_position 		= 0;
			reg.company_position 	= faker.lorem.word();
			// reg.created_at 			= faker.date.past();

			fakes.push(reg);
			qtt--;
		}

		return fakes;

	}
}