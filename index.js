var express = require('express');
var mysql2 = require('mysql2');
var path = require('path')
var app = express();
var bopa = require('body-parser');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var cookie = require('cookie-parser');

app.set("view engine", "ejs");
// app.use(express.static())
app.use(express.static(path.join(__dirname+'/public')));

app.use(bopa.urlencoded({ extended: false }))
app.use(cookie());
var conn = mysql2.createConnection({
    user: 'root',
    password: 'root',
    host: 'localhost',
    database: 'candidate'
})

conn.connect((err) => {
    if (err) throw err
    console.log('connected!')
})

app.get('/', (req, res) => {
    res.render('register');
})

app.get('/home', (req, res) => {
    // console.log(".home")
    try {
        let token = req.cookies.harshil || "null";

        if (token == "null") {
            res.redirect("/login")
        } else {
            let tokendata = jwt.verify(token, 'harshil');

            conn.query(`select * from registration where email = '${tokendata.email}'`, (err, data) => {
                // console.log(data);

                if (tokendata.email == data[0].email) {
                    // res.redirect('/login');
                    res.render('home',{data:data})
                }
               
            })

        }
    } catch (err) {
        res.clearCookie('harshil');
        res.send(`you have to login again  <a href='/login'>login</a>`)
    }
})


app.get('/login', (req, res) => {
    let token = req.cookies.harshil;
    if (!token) {
        res.render('login');
    }
    else {
        res.redirect('/home')
    }

})

app.get('/logout', (req, res) => {
    res.clearCookie('harshil');
    res.redirect('/login')
})


app.get('/alltasks',(req,res)=>{
  res.render('alltasks')
})


app.post('/register', async (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let confirmpassword = req.body.confirmpassword;
    let bpass = await bcrypt.hash(password, 5)
    // console.log(name, email, bpass, confirmpassword) 
    if (password === confirmpassword) {
        conn.query(`insert into registration (name,email,password,cpassword) values ('${name}','${email}','${bpass}','${confirmpassword}')`, (err, data) => {
            if (err) throw err;
            res.render('register', data);
        })
    }
    else {
        console.log('passwords are not matching... plz enter proper password')
    }
})


app.post('/loginpage', async (req, res) => {
    let email = req.body.email;
    let pass = req.body.pass;

    conn.query(`select password from candidate.registration where email='${email}'`, async (err, data) => {
        if (err) throw err;
        let payload = {
            email: email
        }
        let dcry = await bcrypt.compare(pass, data[0].password);
        console.log(dcry)

        let jwttoken = jwt.sign(payload, 'harshil')
        res.cookie('harshil', jwttoken)
        res.redirect('/home')
    })
})

app.get("/email",(req,res)=>{
    var email1=req.query.email;
    conn.query(`select email from  registration where email='${email1}'`,(err,result)=>{
        if(err) throw err;
        console.log(result)
        if(result.length==0){
            res.json("false")
        }
        else{
            res.json("true")
        }
    })
})
app.get('/edit',(req,res)=>{
    let token = req.cookies.harshil;
    let tokendata = jwt.verify(token, 'harshil');
    conn.query(`select * from registration where email = '${tokendata.email}'`, (err, data) => {
        console.log(data);

        if (tokendata.email == data[0].email) {
            // res.redirect('/login');
            res.render('editform',{data:data})
        }
    })

})

app.post('/update',(req,res)=>{
    let name = req.body.name;
    console.log(req.body);
    let email = req.body.email;
    let email1 = req.body.email1;
    conn.query(`update registration set name='${name}',email ='${email}' where email='${email1}'`, (err,data)=>{
        console.log(data);
        console.log('hello')
         res.redirect('/logout');
    })
})

app.listen(6656, () => {
    console.log('port is running!')
})








