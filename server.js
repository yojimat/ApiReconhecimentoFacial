const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')
const db = knex({
	client: 'pg',
	connection: {
		connectionString : process.env.DATABASE_URL,
		ssl: true
	}
});
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (request, response) => {
	//exSelect.
	/*db.select('*').from('usuarios').orderBy('postagens', 'desc').then(data => {
	response.send(data);
	});*/
	response.send('Server funcionando');
});

app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) }  );

app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) });

app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db) });

app.put('/image', (req, res) => { image.handleImage(req, res, db) });

app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) });

app.listen(process.env.PORT || 3000, ()=> {
	console.log(`aplicativo está rodando no ${process.env.PORT}.`);
});
/* Planejamento do aplicativo, Tente sempre planejar antes de começar.
response = this is working
signin --> POST = success/fail;
register --> POST = user
profile/:userid --> Get = user
image --> PUT --> user
*/