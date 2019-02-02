const jwt = require('jsonwebtoken');
const redis = require('redis');

//setup Redis:
const redisClient = redis.createClient(process.env.REDIS_URI);

const handleSignin = (db, bcrypt, req, res) => {
	const { email, senha } = req.body;

	if (!email || !senha) {
		return Promise.reject("Formulário incorreto.");
	}

	return db.select('email', 'hash').from('login')
		.where('email', '=', email)
		.then(data => {
			const isValid = bcrypt.compareSync(senha, data[0].hash);
			if (isValid) {
				return db.select('*').from('usuarios')
					.where('email', '=', email)
					.then(user => user[0])
					.catch(err => Promise.reject('Servidor não respondeu.'));
			} else {
				return Promise.reject('Dados incorretos.Db');
			}
		})
		.catch(err => Promise.reject('Dados incorretos.'));
}

const getAuthTokenId = (req, res) => {
	const { authorization } = req.headers;

	return redisClient.get(authorization, (error, reply) => {
		if (error || !reply ) {
			return res.status(400).json("Não autorizado");
		}
		return res.json({id: reply});
	});
}

const signToken = (email) => {
	const jwtPayload = { email };
	return jwt.sign(jwtPayload, 'segredo', { expiresIn: '2 days'});
}

const setToken = (key, value) => {
	return Promise.resolve(redisClient.set(key, value));
}

const createSessions = (user) => {
	//JWT toke, return user data.
	const {email, id } = user;
	const token = signToken(email);
	return setToken(token, id)
		.then(() => ({ sucess: 'true', userId: id, token }))
		.catch(console.log);
}

const signinAuthentication = (db, bcrypt) => (req, res) => {
	const { authorization } = req.headers;

	return authorization ? 
		getAuthTokenId(req, res) : 
		handleSignin(db, bcrypt, req, res)
			.then(data => {
				return data.id  && data.email ? createSessions(data) : Promise.reject(data);
			})
			.then(session => res.json(session))
			.catch(err => res.status(400).json(err));
}

module.exports = {
	signinAuthentication,
	redisClient,
	getAuthTokenId,
	createSessions
}