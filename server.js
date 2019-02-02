const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const morgan = require('morgan');
const formData = require('express-form-data');
const db = knex({
	client: 'pg',
	connection: {
		connectionString : process.env.DATABASE_URL,
		ssl: true
	}
});
/* 
	client: 'pg',
	connection: process.env.POSTGRES_URI
});
 Conexão usando variavel de ambiente do docker.*/
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const auth = require('./controllers/authorization');
const app = express();
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
  });

} else {

	// Priority serve any static files.
  	app.use(express.static(path.resolve(__dirname, './apireconhecimentofacial/build')));

	app.use(morgan('combined'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(cors());
	app.use(formData.parse());

	app.get('/', (request, response) => {
		response.send("server funcionando");
	});

	app.post('/signin', signin.signinAuthentication( db, bcrypt ));

	app.post('/register', register.registerAuthentication( db, bcrypt ));

	app.get('/profile/:id', auth.requireAuth, (req, res) => { profile.handleProfileGet(req, res, db) });

	app.post('/profile/:id', auth.requireAuth, (req, res) => { profile.handleProfileUpdate(req, res, db)});

	app.post('/image-profile-upload', auth.requireAuth, (req, res) => { profile.postProfileImage(req, res, db)});

	app.put('/image', auth.requireAuth, (req, res) => { image.handleImage(req, res, db) });

	app.post('/imageurl', auth.requireAuth, (req, res) => { image.handleApiCall(req, res) });

	app.get('*', function(request, response) {
    	response.sendFile(path.resolve(__dirname, './apireconhecimentofacial/build', 'index.html'));
  	});

	app.listen(PORT, ()=> {
		console.error(`Node ${isDev ? 'dev server' : 'cluster worker '+process.pid}: listening on port ${PORT}`);
	});
}
/* Planejamento do aplicativo, Tente sempre planejar antes de começar.
response = this is working
signin --> POST = success/fail;
register --> POST = user
profile/:userid --> Get = user
image --> PUT --> user
*/
//docker-compose up: inicia o database e o server.
//docker-compose down: para os serviços e com '--volumes' mata eles no pc. 
//docker-machine stop: para os serviços.
//docker volume prune: deleta os volumes salvos na maquina virtual.
// docker exec -it <container name> /bin/bash: comando pra entrar em um container.
//psql -d database -U  user -W : comando pra entrar no banco.	
