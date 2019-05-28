const express = require('express');
const path = require('path');
const multer = require('multer');


const {
    MongoClient
} = require('mongodb');
const conf = require('./config');
const session = require('express-session');


const app = express();
const port = process.env.PORT || 3000;

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false
    }
}));



// use this tow lines code so we can get (posted data) 
// using req.body
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const dbName = 'herokuwebDB';
    (async function mongo() {
        let client;
        try {
            client = await MongoClient.connect(conf.mongoURI, {
                useNewUrlParser: true
            });
            const db = client.db(dbName);
            const user = await db.collection('users').findOne({
                username: req.body.lg_username,
                password: req.body.lg_password
            });
            client.close();
            if (user) {
                req.session.user = user;
                res.redirect('/profile');
            } else {
                res.redirect('/error');
            }
        } catch (error) {
            res.send(error.message);
        }
    }())
    //console.log(req.body.lg_username, req.body.lg_password);
    //res.render('login');
});
app.get('/profile', (req, res) => {
    if (req.session.user) {
        res.send('profile welcome ' + req.session.user.username + ' <br> <a href="/logout">Log out </a> <br><img src="/uploads/' + req.session.user.avatar + '">');
    } else {
        res.redirect('/')
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/')
});
app.get('/register', (req, res) => {
    res.render('register');
});


//configuration of multer to upload file
const storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: function (req, file, cb) {

        cb(null, file.originalname)


    }
});
const upload = multer({
    storage: storage
})
app.use('/register', upload.single('reg_avatar'))
app.post('/register', (req, res) => {
    upload.single('reg_avatar')





    const dbName = 'herokuwebDB';
    (async function mongo() {
        let client;
        try {
            client = await MongoClient.connect(conf.mongoURI, {
                useNewUrlParser: true
            });
            const db = client.db(dbName);


            const upload = multer({
                storage: storage
            });
            upload.single('avatar')


            const user = await db.collection('users').insertOne({
                username: req.body.reg_username,
                password: req.body.reg_password,
                email: req.body.email,
                fullname: req.body.reg_fullname,
                gender: req.body.reg_gender,
                avatar: req.file.filename

            });
            client.close();

            res.redirect('/profile');

        } catch (error) {
            res.send(error.message);
        }
    }());

});



app.post('/profile', (req, res) => {
    (async function mongo() {
        let client;
        try {
            client = await MongoClient.connect(dbUrl, {
                useNewUrlParser: true
            })
            const db = client.db(dbName);
            const user = await db.collection('users').findOne({
                username: email
            });
        } catch (error) {

        }
    }());

});


app.get('/error', (req, res) => {
    res.send('username or password is wrong');
});

app.listen(port, () => {
    console.log(`App listening on port ${port}!`);
});