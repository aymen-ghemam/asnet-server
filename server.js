require('dotenv').config();
const   express = require('express'),
        mysql = require('mysql2'),
        jwt = require('jsonwebtoken'),
        path = require('path'),
        multer = require('multer'),
        bcrypt = require('bcrypt');

const JWT_STRING = process.env.JWT_STRING;
const PORT = process.env.PORT || 3000;

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
});



connection.connect(function(error){
    if(error){
      console.log(error);
    }else{ 
      console.log('Connected!:)');
    }
});

// FORMAT OF THE TOKEN: Authorization: Bearer <access_token>
const verifyToken = (req, res, next) => {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if(typeof bearerHeader !== 'undefined') {
      // Split at the space
      const bearer = bearerHeader.split(' ');
      // Get token from array
      const bearerToken = bearer[1];
      // Set the token
      req.token = bearerToken;
      // Next middleware
      jwt.verify(req.token, JWT_STRING, (err, authData) => {
        if(err) {
          res.json({error: true});
        } 
        else {
          req.user = authData.user;
          next();
            // res.json({error: false, user: authData.user});
        }
      });
      
    } else {
      // Forbidden
      res.status(403).json({error: true});
    }
}


const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
// io.on('connection', () => { /* … */ });


app.use(express.urlencoded({extended: true})); 
app.use(express.json());
// app.use(express.static(path.join(__dirname, './public')));

app.use('/api/uploads', express.static(path.join(__dirname, './uploads')));
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, `img-${Date.now()}.${file.mimetype.split('/')[1]}`)
    }
})
var upload = multer({ storage: storage });




app.post('/api/images', upload.single('image'),(req, res) => {
    // req.file is the `image` file
    // req.body will hold the text fields, if there were any   
    res.json({error: false, url: `http://localhost:${PORT}/api/uploads/${req.file.filename}`});
});




// ################### Routes ###################

app.post('/api/login', (req, res) => {
  console.log(req.body);
  // check if the user exists
  connection.execute(`select id_user, type, nom, prenom from user where email = ? and password = ?`, [req.body.email, req.body.password], (err, result)=>{
      if (err) res.json({error: true, msg: 'Database error!!'})
      else if(result[0] === undefined) res.json({error: true, msg: 'Wrong email or password !'})
      else 
          jwt.sign({user: result[0]}, JWT_STRING, { expiresIn: '999999999999999s' }, (err, token) => {
              res.json({error: false,token});
          });
  });
});

app.get('/api/user', verifyToken, (req, res) => {
  res.json({error: false, user:req.user});
})


app.post('/api/adminlogin', (req, res) => {
  // check if the admin exists
  connection.execute(`select id_admin, username, password, nom from admin where username = ? and password = ?`,
  [req.body.username, req.body.password], (err, result)=>{
      if (err) res.json({error: true, msg: 'Database error!!'})
      else if(result[0] === undefined) res.json({error: true, msg: 'Wrong username or password !'})
      else 
        jwt.sign({user: result[0]}, JWT_STRING, { expiresIn: '999999999999999s' }, (err, token) => {
            res.json({error: false,token});
        });
  });
});

app.get('/api/admin', verifyToken, (req, res) => {
  res.json({error: false, user:req.user});
})

app.post('/api/users', (req, res) => {
  console.log(req.body);
  connection.execute(`select email from user where email = ?`, [req.body.email], async (err, result) => {
      if(err) console.log(err);
      else if(result[0] != undefined) res.json({msg: 'email already in use !'})
      else {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        connection.execute(
          `insert into user (nom, prenom, email, password, numero, sexe, date_naissance, photo, type, date_inscription) 
          values(?, ?, ?, ?, ?, ?, ?, ?, 0 , now() )`
            , [req.body.nom, req.body.prenom, req.body.email, req.body.password, req.body.numero, req.body.sexe, req.body.naissance, req.body.photo]
            ,(err, user) => {
            if(err) {
                console.log(err);
                res.json({error: true, msg:'DATABASE error!'})
            }
            else {
                res.json({error: false})
            }
         })
      }
  })
});

app.post('/api/specialistes', (req, res) => {
  connection.execute(`select email from user where email = '${req.body.email}'`, (err, result) => {
      if(err) console.log(err);
      else if(result[0] != undefined) res.json({msg: 'email already in use !'})
      else {
          connection.execute(
            `insert into user (nom, prenom, email, password, numero, sexe, date_naissance, photo, type, date_inscription) 
            values(?, ?, ?, ?, ?, ?, ?, ?, 0 , now() )`
              ,[req.body.nom, req.body.prenom, req.body.email, req.body.password, req.body.numero, req.body.sexe, req.body.naissance, req.body.photo]
              ,(err, user) => {
              if(err) {
                  res.json({error: true, msg:'DATABASE error!'})
              }
              else {
                  connection.execute(`insert into specialiste(id_specialiste) values(?)`, [user.insertId], (err, specialiste)=> {
                      if(err) {
                          res.json({error: true, msg:'DATABASE error!'})
                      }
                      else res.json({error: false}); 
                  })
              }
         })
      }
  })
});

// articles
app.post('/api/articles', verifyToken, (req, res) => {  
  if(req.user.type === 1){
    let inserts = [];
    
    connection.execute(`insert into article(date_creation, titre, id_specialiste) 
    values (now(), ?, ?)`, [req.body.titre, req.user.id_user], (err, article) => {
      if(err) {
        res.json({error: true, msg: 'Database error!'});
        console.log(err);
      }
      else {
        req.body.sections.forEach(section => {
          inserts.push([article.insertId, section.titre, section.contenu, section.image, section.indice]);
        });
        connection.query(`insert into section(id_article, titre_section, contenu_section, image_section, indice) values ?`
          , [inserts], (err, result)=> {
          if(err) {
            console.log(err);
            res.json({error: true, msg: 'Database error!'});
          }
          else {
            let tags = [];
            req.body.tags.forEach(tag => {
              tags.push([tag.nom, article.insertId])
            });

            connection.execute(`insert into tag (nom, id_article) values ?`, [tags], (err, result)=>{
              if(err) {
                console.log(err);
                res.json({error: true, msg: 'Database error!'});
              }
              else {
                res.status(200).json({error: false})
              }
            })
          }
        })
      }
    })
  }
  else res.json({error: true})
});

app.get('/api/articles', (req, res) => {  
  connection.execute(`select A.id_article, A.date_creation, A.titre, A.id_specialiste, S.contenu_section from article A, section S 
  where S.id_article = A.id_article and S.indice = 0 order by id_article asc`
  ,(err, articles)=> {
    if(err) {
      console.log(err);
      res.json({error: true, msg: 'Database error!'});
    }
    else{
      res.status(200).json({error: false, articles})
    }
  })
});

app.get('/api/articles/:id', (req, res) => {  
  connection.execute(`select * from article where id_article = ${req.params.id}`, (err, articles)=> {
    if(err) {
      console.log(err);
      res.json({error: true, msg: 'Database error!'});
    }
    else{
      connection.execute(`select titre_section, contenu_seciton, image_section, indice from section 
      where id_article = ?`, [req.params.id], (err, sections) => {
        if(err) {
          console.log(err);
          res.json({error: true, msg: 'Database error!'});
        }
        else {
          res.json({
            error: false,
            article: {
              ...articles[0],
              sections
            }
          })
        }
      })
    }
  })
});

app.put('/api/articles/:id', verifyToken, (req, res) => {
  if(req.user.type === 1){
    connection.execute(`update article set titre = ? where id_article = ?`, [req.body.titre, req.params.id], (err, article)=>{
      if(err) {
        console.log(err);
        res.json({error: true, msg: 'Database error!'});
      }
      else {
        connection.execute(`delete from section where id_article = ?`, [req.params.id], (err, result)=> {
          if(err) {
            console.log(err);
            res.json({error: true, msg: 'Database error!'});
          }
          else {
            let inserts = [];
            req.body.sections.forEach(section => {
              inserts.push([req.params.id, section.titre, section.contenu, section.image, section.indice]);
            });
            connection.query(`insert into section(id_article, titre_section, contenu_section, image_section, indice) values ?`
              , [inserts], (err, result)=> {
              if(err) {
                console.log(err);
                res.json({error: true, msg: 'Database error!'});
              }
              else res.json({error: false})
            })
          }
        })
      }
    })
  }
})


// evenement
app.post('/api/evenements', verifyToken, (req, res) => {  
  if(typeof req.user !== undefined){
    connection.execute(`insert into evenement(date_evenement, titre, desc, image, id_admin) values (?, ?, ?, ?, ?)`
    , [req.body.date, req.body.titre, req.body.desc, req.body.image, req.user.id_admin], (err, evenement)=>{
      if(err) {
        console.log(err);
        res.json({error: true, msg: 'database error'});
      }
      else{
        res.status(200).json({error: false})
      }
    })
  }
  else res.status(403).json({error: true})
});

app.get('/api/evenements', verifyToken, (req, res) => {  
  connection.execute(`select * from evenement order by id_evenement asc`
  ,(err, evenements)=> {
    if(err) {
      console.log(err);
      res.json({error: true, msg: 'Database error!'});
    }
    else{
      res.status(200).json({error: false, evenements})
    }
  })
});

app.get('/api/evenements/:id', verifyToken, (req, res) => {  
  connection.execute('select * from evenement where id_evenement = ?', [req.params.id], (err, evenements)=>{
    if(err) {
      console.log(err);
      res.json({error: true, msg: 'Database error!'});
    }
    else {
      res.status(200).json({error: false, evenement: evenements[0]});
    }
  })
});


app.post('/api/benevole', (req, res)=> {
  connection.execute('insert into benevole (nom, numero, email, date_inscription) values (?, ?, ?, now())'
  , [req.body.nom, req.body.numero, req.body.email]
  , (err, result)=>{
    if(err) res.json({error: true, msg: 'Database error!'});
    else res.status(200).json({error: false});
  })
})


app.get('/api/conversations', verifyToken, (req, res)=>{
  connection.execute(`select c.*, m.* from conversation c, message m 
  where( ((c.id_user = ? or c.id_specialiste = ?)) and m.id_message = c.id_dernier_msg )`
  , [req.user.id_user, req.user.id_user]
  , (err, conversations)=>{
    if(err) res.json({error: true, msg: 'Database error!'});
    else {

    }
  })
})

server.listen(PORT, ()=> console.log('server running on port ', PORT, '...'))