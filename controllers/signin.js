const handleSignin = (req, res, db, bcrypt) => {
	const { email, senha } = req.body;

	if (!email || !senha) {
		return res.status(400).json("Formulário incorreto.");
	}

	db.select('email', 'hash').from('login')
		.where('email', 'like', email)
		.then(data => {
			const isValid = bcrypt.compareSync(senha, data[0].hash);
			if (isValid) {
				db.select('*').from('usuarios')
				.where('email', 'like', email)
				.then(user => {
					res.json(user[0]);		
				})
				.catch(err => res.status(400).json('Servidor não respondeu.'));
			} else {
				res.status(400).json('Dados incorretos.');
			}
		})
		.catch(err => res.status(400).json('Dados incorretos.'));
}

module.exports = {
	handleSignin
}