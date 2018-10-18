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
}

module.exports = {
	handleProfileGet
}