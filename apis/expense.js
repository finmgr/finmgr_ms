const {MongoClient} = require('mongodb');

const uri = "mongodb+srv://ukencaph:ukencaph@enbits.4gilqgs.mongodb.net/?retryWrites=true&w=majority";

var expense = {
    all: async function(req,res){ 
        console.log("inside get method");
        const client = new MongoClient(uri);
        try {
            await client.connect();
            databasesList = await client.db("finmgr").collection("entries").find().toArray();
           // databasesList.databases.forEach(db => data.push(db));
         
        } catch (e) {
            console.error(e);
        }
        finally {
            await client.close();
        }
    
        res.json(databasesList); 
    },
    add: async function(req, res){
        console.log("inside POST method of adding expense")
        const client = new MongoClient(uri)
        try{
            await client.connect();
            databasesList = await client.db("finmgr").collection("entries").insertOne(req.body);

        }
        catch(e){
            console.error(e);

        }
        finally {
            await client.close();
        }
        res.json(databasesList);
    }
}

module.exports = expense;