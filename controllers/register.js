const handleRegister = (req, res, db, bcrypt)=> {
	const { email, nome, senha} = req.body;
	const hash = bcrypt.hashSync(senha);

	if (!email || !nome || !senha) {
		return res.status(400).json("Formulário incorreto.");
	}

	db.transaction(trx =>{
		trx.insert({
		email: email,
		hash: hash
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('usuarios')
				.returning('*')
				.insert({
					email: loginEmail[0],
					nome: nome,
					inscricao: new Date()
				})
				.then(user => {
					res.json(user[0]);
				});
		})
		.then(trx.commit)
		.catch(trx.rollback);
	})
	.catch(error => res.status(400).json('Não pode se inscrever.'));

	//Exemplo de hardcoding um usuario
	/*database.usuarios.push({
		id: '125',
		nome: nome,
		email: email,
		entradas: 0,
		registrado: new Date()
	});*/
}

module.exports = {
	handleRegister
};