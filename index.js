'use strict';

const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');


const app = express();
app.use(express.static('public'));
app.use(fileUpload({
  createParentPath: true
}));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

// PORT to listen on
const port = process.env.PORT || 3000;
// TOKEN required for upload
const upload_token = process.env.TOKEN || "d07761d8f74207917c61dd05627dab6d";


app.listen(port, () => {
  console.log(`App is listening on port ${port}.`)
})

app.post('/upload', async (req, res) => {
  try {
      if(!req.files){
          res.send({
              status: false,
              message: 'No file uploaded'
          });
      } else if ( req.body.token != upload_token ) {
        res.send({
          status: false,
          message: 'Invalid Token'
      });
      } else {
          let data = []; 
          let my_hash = "";

          //loop all files
          _.forEach(_.keysIn(req.files), (key) => {
              let file = req.files[key];

              if ( my_hash == "" ){
                my_hash = encodeURIComponent(file.md5);
                console.log( "HASH: " + my_hash );
              }
              
              //move file to uploads directory
              file.mv('./public/' + my_hash + "/" + file.name);

              //push file details
              data.push({
                  name: file.name,
                  mimetype: file.mimetype,
                  size: file.size,
                  link: 'https://rootmd.jdbburg.com/' + my_hash + "/" + file.name
              });
          });
          console.log( data );
  
          //return response
          res.send({
              status: true,
              message: 'Files are uploaded',
              data: data
          });
      }
  } catch (err) {
      res.status(500).send(err);
  }
});