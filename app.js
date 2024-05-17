//Configurando a conexão com o MongoDB
const {MongoClient, ObjectId} = require("mongodb");
async function connect(){
    if(global.db) return global.db;
    const conn = await MongoClient.connect("mongodb+srv://brenonogg:6gfqiJJtU43xfM2I@cluster.b5mzyyp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster");
if(!conn) return new Error("Erro na conexão");
    global.db  = await conn.db("unifor");
    return global.db;
}

// Configuração do Express JS
const express = require('express');
const { default: axios } = require("axios");
const app     = express();
const port    = 3000; // porta padrão

const jwt = require('jsonwebtoken');
const { eAdmin } = require("./middlewares/auth");

// Serialização do JSON
app.use(require('cors')());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Definindo rota de teste
const router  = express.Router();
router.get('/', (req, res) => {
    res.json({message: 'Rota de teste OK!'})
});

//API REST cliente

// Listar Usuários
router.get('/cliente/:id?', async function(req, res, next){
    try{
        const db  = await connect();
        if(req.params.id){
            res.json(await db.collection("cliente").findOne({_id: new ObjectId(req.params.id)}));
        }else{
         res.json(await db.collection("cliente").find().toArray());
        }
    }
    catch(ex){
        console.log(ex)
        res.status(400).json({erro: `${ex}`});
    }
});
    

// Rota de Login
router.post('/login', async function(req, res, next){
    try {
        const { email, password } = req.body;
        const secret = 'D62ST92Y7A6V7K5C6W9ZU6W8KS3';
        const db = await connect();
        
        // Verifique se o usuário com o email e senha fornecidos existe no banco de dados
        const user = await db.collection("cliente").findOne({ email, password });
        
        if (user) {
            const token = jwt.sign({id: user._id}, secret, {expiresIn: '1h'});
            // Se o usuário existe, envie os detalhes do usuário como resposta
            res.status(200).json({user, token, msg:'So sucesso'})
        } else {
            // Se as credenciais estiverem incorretas, envie uma mensagem de erro
            res.status(401).json({ message: "Credenciais inválidas" }, );
        }
    } catch(ex) {
        console.error(ex);
        res.status(500).json({ erro: `${ex}` });
    }
});

// POST
router.post('/cliente', async function(req, res, next){
    try{
        const cliente = req.body;
        const db  = await connect();
        res.json(await db.collection("cliente").insertOne(cliente))
    }catch(ex){
        console.log(ex)
        res.status(400).json({erro: `${ex}`});
    }
});

// PUT
router.put('/cliente/:id', async function(req, res, next){
    try{
      const cliente = req.body;
      const db = await connect();
      res.json(await db.collection("cliente").updateOne({_id: new ObjectId(req.params.id)}, {$set: cliente}));
    }
    catch(ex){
      console.log(ex);
      res.status(400).json({erro: `${ex}`});
    }
});

// DELETE
router.delete('/cliente/:id', async function(req, res, next){
    try{
      const db = await connect();
      res.json(await db.collection("cliente").deleteOne({_id: new ObjectId(req.params.id)}));
    }catch(ex){
      console.log(ex);
      res.status(400).json({erro: `${ex}`});
    }
});

app.use('/', router);

//Inicia o servidor
app.listen(port);
console.log('API funcionando!');