const clarifai = require('clarifai');

const app = new Clarifai.App({
  apiKey: 'cf40f23ec9e34893b9fd257757e43709'
});

const handleApiCall = (req, res) => {
	app.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
	.then(data => {
		res.json(data);
	})
	.catch(error => res.status(400).json("Api não está funcionando."));
}

const handleImage = (req, res, db) => {
	const { id } = req.body;

	db('usuarios').where('id', '=', id)
	.increment('postagens', 1)
	.returning('postagens')
	.then(post => {
		if (post.length) {
		res.json(post);
		} else {
			res.status(400).json('Id incorreto.');
		}
	}).catch( err => {
		res.status(400).json('Incapaz de conseguir o numero de postagens.');
	});
}

module.exports = {
	handleImage,
	handleApiCall
}