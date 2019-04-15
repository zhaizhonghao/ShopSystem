const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://wang:123456@192.168.2.104:27017';

// Database Name
const dbName = 'productmanage';

// Create a new MongoClient
const client = new MongoClient(url, {
    useNewUrlParser: true
});

const _connectDB = function (callback) {
    client.connect(function(err) {
        if (err) {
            console.log(err)
            console.log("Failed to connect to server");
        }
        console.log("Connected correctly to server");
        const db = client.db(dbName);
        callback(db)
    },{ useNewUrlParser: true })
}

exports.find = function (collectionName,json,callback) {
    _connectDB(function (db) {
        // Get the documents collection

        const collection = db.collection(collectionName);
        // Find some record
        collection.find(json).toArray(function(err, docs) {
            callback(docs);

        });
    })

}
exports.insert = function (collectionName,json,callback) {
    _connectDB(function (db) {
        // Get the documents collection

        const collection = db.collection(collectionName);
        // insert some record
        collection.insertOne(json,function (err) {
            if (err) {
                console.log(err)
            }
            console.log('插入成功')
            callback(err)
        })

    })
}

exports.update = function (collectionName,json1,json2,callback) {
    _connectDB(function (db) {

        const collection = db.collection(collectionName);
        // update some record
        collection.updateOne(json1,{$set:json2},function (err) {
            if (err) {
                console.log(err)
            }
            console.log('更新成功')
            callback(err)
        })

    })
}

exports.deleteOne = function (collectionName,json,callback) {
    _connectDB(function (db) {
        const collection = db.collection(collectionName);
        // remove some record

        collection.deleteOne(json,function (err) {
            if (err) {
                console.log(err)
            }
            console.log('删除成功')
            callback(err)
        })

    })
}







