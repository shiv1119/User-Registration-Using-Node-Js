const mongoose = require('mongoose');   
const Users = require('./user');         
const express = require('express');            
const bodyParser = require('body-parser');       
const path = require('path');
const bcrypt = require('bcrypt');

const saltRounds = 5;
const password = "adminPassword";

const app = express();
const port = 3000;

const uri = "mongodb://adminUser:adminPassword@localhost:27017";
mongoose.connect(uri, {'dbName':'userDB'}).then(()=>
    console.log("Database connection established: "))
    .catch(err=>console.log("database connection error", err));
;

app.use("*", bodyParser.json()); //middleware to prase json requests

app.use('/static', express.static(path.join(".", 'frontend')));

app.use(bodyParser.urlencoded({extended:true})); //Middleware to handel url-encoded from data

app.post('/api/login', async (req, res) =>{
    const data = req.body;
    console.log(data);
    let user_name = data['user_name'];
    let password = data['password'];
    const documents = await Users.find({user_name: user_name});
    if(documents.length > 0){
        let result = await bcrypt.compare(password, documents[0]['password'])
        if(result){
            res.send("User Logged In");
        } else {
            res.send("Password Incorrect");
        }
    } else {
        res.send("Incorrect information check again");
    }
});


app.post('/api/add_user', async(req, res)=>{
    const data = req.body;
    console.log(data);
    const documents = await Users.find({user_name: data['user_name']});
    if(documents.length > 0){
        res.send("User Already exists");
    }

    let hashedpwd = bcrypt.hashSync(data['password'], saltRounds);

    const user = new Users({
        "user_name": data['user_name'],
        "age": data['age'],
        "password": hashedpwd,
        "email": data['email']
    });
    await user.save();

    res.send("User added successfully");
})

app.get('/', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'frontend', 'home.html'));
    } catch (error) {
        console.log('Error in /:', error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});


