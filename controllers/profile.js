const cloudinary = require('cloudinary');

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME_CLOUDINARY,//process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY_CLOUDINARY,//process.env.API_KEY, 
  api_secret: process.env.API_SECRET_CLOUDINARY//process.env.API_SECRET
})

const handleProfileGet = (req, res, db) => {
	const { id } = req.params;

	db.select('*').from('usuarios').where({id})
	.then(user => {
		if (user.length) {
		res.json(user[0]);	
		} else {
			res.status(400).json('Não encontrado.');
		}
	})
	.catch(error => res.status(400).json('Erro ao encontrar usuario.'));
};

const handleProfileUpdate = (req, res, db) => {
	const { id } = req.params;
	const { nome, idade, pet } = req.body.formInput;

	db('usuarios')
		.where({ id })
		.update({ nome, idade, pet })
		.then(resp => {
			if (resp) {
				res.json("Feito!");
			} else {
				res.status(400).json("Não atualizou o perfil.");
			}
		})
		.catch(error => res.status(400).json("Erro ao atualizar perfil."));
};

const postProfileImage = (req, res, db) => {
	const values = Object.values(req.files)
  	const promises = values.map(image => cloudinary.uploader.upload(image.path))
  	const id = req.body.id;

  	Promise
    	.all(promises)
    	.then(results => {
    		const imageProfile = results[0].secure_url;

    		db('usuarios')
  				.where({ id })
  				.update({ imageprofile: imageProfile })
  				.then(resp => {
  					if (resp) {
  						return console.log("Imagem salva com sucesso!");
  					} else {
  						return res.status(401).json("Img não atualizada");
  					}
  				});
    		return res.json(results);
    	})
    	.catch((err) => res.status(400).json(err)) 
}

module.exports = {
	handleProfileGet,
	handleProfileUpdate,
	postProfileImage
}