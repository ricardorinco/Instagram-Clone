var express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    multiparty = require('connect-multiparty'),
    mongodb = require('mongodb'),
    objectId = require('mongodb').ObjectId;

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multiparty());

app.use(function (req, res, next) {
    // res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:1080');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

var database = new mongodb.Db(
    'instagram',
    new mongodb.Server(
        'localhost',
        27017,
        {}
    ),
    {}
);

app.get('/', function (req, res) {
    res.send({ 'Mensagem': 'Deus é fiel' });
});

// Get
app.get('/api', function (req, res) {
    database.open(function (err, mongoClient) {
        mongoClient.collection('postagens', function (err, collection) {
            collection.find().toArray(function (err, results) {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json(results);
                }

                mongoClient.close();
            });

        });
    });
});

// Get
app.get('/imagens/:imagem', function (req, res) {
    var img = req.params.imagem;

    fs.readFile(`C:/Users/Ricardo/Desktop/uploads/${img}`, function (err, content) {
        if (err) {
            res.status(400).json(err);
            return;
        }

        res.writeHead(200, { 'content-type': 'image/jpg' });
        res.end(content);
    });
});

// GetById
app.get('/api/:id', function (req, res) {
    database.open(function (err, mongoClient) {
        mongoClient.collection('postagens', function (err, collection) {
            collection.find(objectId(req.params.id)).toArray(function (err, results) {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json(results);
                }

                mongoClient.close();
            });

        });
    });
});

// Post
app.post('/api', function (req, res) {
    var date = new Date();
    var timestamp = date.getTime();

    var originalFileName = `${timestamp}_${req.files.arquivo.originalFilename}`;
    var pathOrigem = req.files.arquivo.path;
    var pathDestino = `C:/Users/Ricardo/Desktop/uploads/${originalFileName}`;

    fs.rename(pathOrigem, pathDestino, function (err) {
        if (err) {
            res.status(500).json({ error: err });
            return;
        }

        var dados = {
            url_image: originalFileName,
            titulo: req.body.titulo
        };

        database.open(function (err, mongoClient) {
            mongoClient.collection('postagens', function (err, collection) {
                collection.insert(dados, function (err, results) {
                    if (err) {
                        res.json('err');
                    } else {
                        res.status(200).json(results);
                    }

                    mongoClient.close();
                });
            });
        });
    });
});

// Put
app.put('/api/:id', function (req, res) {
    var dados = req.body.comentario;

    database.open(function (err, mongoClient) {
        mongoClient.collection('postagens', function (err, collection) {
            collection.update(
                { _id: objectId(req.params.id) },
                {
                    $push: {
                        comentarios:
                        {
                            id_comentario: new objectId(),
                            comentario: req.body.comentario
                        }
                    }
                },
                {},
                function (err, results) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(200).json(results);
                    }

                    mongoClient.close();
                }
            );
        });
    });
});

// Delete
app.delete('/api/:id', function (req, res) {
    var dados = req.body;

    database.open(function (err, mongoClient) {
        mongoClient.collection('postagens', function (err, collection) {
            collection.update(
                {},
                {
                    $pull: {
                        comentarios: {
                            id_comentario: objectId(req.params.id)
                        }
                    }
                },
                { multi: true },
                function (err, results) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(200).json(results);
                    }

                    mongoClient.close();
                });
        });
    });
});

module.exports = app;