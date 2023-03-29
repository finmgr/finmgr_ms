const {MongoClient, ObjectId} = require('mongodb');
const webpush = require('web-push');
var vapidKeys = {
    publicKey: 'BMafcqtSh7wn6SkFZ1MGZMzJKXTF080afqHfQpTZBKSQyMdRrVWQ3xO_ri-NrOb-aS5cM-go4FHS2MeA6cXDcBg',
    privateKey: 'NdNfHRPl5s5PhT64iQmHVGfVj2g3MmmMMrjO4GGjN4Q'
  }
  const subscription = {
    "endpoint": "https://fcm.googleapis.com/fcm/send/cUmFIvyTFbc:APA91bHigxd1Yq4TMXpDXOQRP_Ie03kRFvDIKBwqtwD1FUhVncjneL5PlA8YGY2dEYTPrtLAc1CvTPQc6ZO_Y80ULREB7GFnY669cEAxvY46f2YqZll60_xVwzREtl_pIyUWGINxTCQo",
    "expirationTime": null,
    "keys": {
      "p256dh": "BGnNhdb6rq4CblZZwqSE0KEpz-40qR7lTc2_cUy44Vy9u8TEgmhd6uW0o5t7cnXlAyyE8_GN2C5On-by3ow2KUc",
      "auth": "r4V0fGjldAI1w8Lr4o0gfw"
    }
  }
const payload = {
    notification: {
        title: 'Item Update',
        body: 'New Activity on Item',
        icon: 'assets/icons/icon-384x384.png',
        actions: [
            { action: 'bar', title: 'Focus last' },
            { action: 'baz', title: 'Navigate last' },
        ],
        data: {
            onActionClick: {
                default: { operation: 'openWindow' },
                bar: {
                    operation: 'focusLastFocusedOrOpen',
                    url: '/',
                },
                baz: {
                    operation: 'navigateLastFocusedOrOpen',
                    url: '/',
                },
            },
        },
    },
};
const options = {
    vapidDetails: {
        subject: 'mailto:startcode.uk@gmail.com',
        publicKey: vapidKeys.publicKey,
        privateKey: vapidKeys.privateKey,
    },
    TTL: 60,
};

const uri = "mongodb+srv://ukencaph:ukencaph@enbits.4gilqgs.mongodb.net/?retryWrites=true&w=majority";

var expense = {
    all: async function(req,res){ 
        const session_id = req.headers.authorization.split(' ')[1];
        if(session_id){
        console.log("inside get method");
        const client = new MongoClient(uri);
        const startDate = new Date(new Date(new Date().setHours(0,0,0,0)).setDate(1));

        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() +1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        console.log(startDate);
        console.log(endDate.toISOString());
        try {
            const options = {
                // sort matched documents in descending order by rating
                sort: { date: 1 },
                // Include only the `title` and `imdb` fields in the returned document
                projection: { _id: 1, name: 1, amount: 1, date: 1 },
              };
            await client.connect();
            console.log(session_id+"_entries")
            databasesList = await client.db("finmgr").collection(session_id+"_entries").find({date: {
                $gte: startDate.toISOString(),
                $lt: endDate.toISOString()
              }}, options).toArray();
            console.log(databasesList)
           // databasesList.databases.forEach(db => data.push(db));
             
        } catch (e) {
            console.error(e);
        }
        finally {
            await client.close();
        }
    
        res.json(databasesList); 
    }else{
        res.status(403).send({
            message: 'Invalid User'
         }); 
    }
    },
    category: async function(req,res){ 
        console.log("inside get method");
        const startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        console.log(startDate.toISOString());
        console.log(endDate.toISOString());
        const session_id = req.headers.authorization.split(' ')[1];
        if(session_id){
            const client = new MongoClient(uri);
        try {
            await client.connect();
            databasesList = await client.db("finmgr").collection(session_id+"_category").find().toArray();
           // databasesList.databases.forEach(db => data.push(db));
         
        } catch (err) {
            res.status(500).send({
                message: 'Error Occured '+err
             }); 
        }
        finally {
            await client.close();
        }
    
        res.json(databasesList); 
        }
        else{
            res.status(403).send({
                message: 'Invalid User'
             }); 
        }
        
    },
    logUserIn : async function(req,res){
        console.log("Starting user Log-in process");
        const client = new MongoClient(uri);
        try{
            await client.connect();
            const houseid = req.body.houseid;
            const password = req.body.password;
            const query = { houseid : houseid };
            const options = {
              
              // Include only the `title` and `imdb` fields in the returned document
              projection: { _id: 0, houseid: 1, password: 1},
            };
            gettingUser = await client.db("finmgr").collection("users").findOne(query,options)
            if(gettingUser){
                gettingUser['session_id'] =  btoa(gettingUser.houseid+":"+gettingUser.password);
            }
        }
        catch(err){
            res.status(500).send({
                message: 'Error Occured '+err
             }); 
        }
        finally{
            await client.close();
        }
        res.json(gettingUser);
    },
    registerUser : async function(req,res){
        console.log("Starting user creation process");
        const client = new MongoClient(uri);
        try{
            await client.connect();
            const houseid = req.body.houseid;
            const password = req.body.password;
            const query = { houseid : houseid };
            const options = {
              // sort matched documents in descending order by rating
              sort: { date: 1 },
              // Include only the `title` and `imdb` fields in the returned document
              projection: { _id: 0, name: 1, amount: 1, date: 1 },
            };
            gettingUser = await client.db("finmgr").collection("users").findOne(query,options)
            if(gettingUser){
                console.log("Another user found with same house id")
                        res.status(400).send({
                            message: 'Duplicate HouseId please use another id'
                         }); 
            }
            else{
                console.log("verified the entered house id is not registered... moving forward")
                createUser = await client.db("finmgr").collection("users").insertOne(req.body);
                if(createUser){
                    console.log("creating collections");
                    const encryptedUser = btoa(houseid+":"+password)
                    createdEntityTable = await client.db("finmgr").createCollection(encryptedUser+"_entity");
                    createdCategoryTable = await client.db("finmgr").createCollection(encryptedUser+"_category");
                }
            }
        }
        catch(err){
            res.status(500).send({
                message: 'Error Occured '+err
             }); 
        }
        finally{
            await client.close();
        }
        res.json(createUser); 
    },
    add: async function(req, res){
        const session_id = req.headers.authorization.split(' ')[1];
        if(session_id){
        console.log("inside POST method of adding expense")
        var reqPayload = req.body;
        reqPayload['name'] = reqPayload['name'].trim();
        const client = new MongoClient(uri)
        try{
            await client.connect();
            databasesList = await client.db("finmgr").collection(session_id+"_entries").insertOne(reqPayload);
            webpush.sendNotification(subscription, JSON.stringify(payload), options)
            .then((_) => {
                console.log('SENT!!!');
                console.log(_);
            })
            .catch((_) => {
                console.log(_);
            });

        }
        catch(e){
            console.error(e);

        }
        finally {   
            await client.close();
        }
        res.json(databasesList);
    }
    else{
        res.status(403).send({
            message: 'Invalid User'
         }); 
    }
    },
    delete: async function(req, res){
        console.log("inside delete method of expense")
        const session_id = req.headers.authorization.split(' ')[1];
        if(session_id){
        const client = new MongoClient(uri)
        try{
            await client.connect();
            
            console.log("delete item with id"+req.params.id)
            var id = new ObjectId(req.params.id);
            const query = { _id: id };
            const options = {
              // sort matched documents in descending order by rating
              sort: { date: 1 },
              // Include only the `title` and `imdb` fields in the returned document
              projection: { _id: 1, name: 1, amount: 1, date: 1 },
            };
        
            console.log("report item with id"+req.params.id)
            databasesList = await client.db("finmgr").collection(session_id+"_entries").findOneAndDelete(query, options);
        }
        

        
        catch(e){
            console.error(e);

        }
        finally {   
            await client.close();
        }
        res.json(databasesList);
         }
    else{
        res.status(403).send({
            message: 'Invalid User'
         }); 
    }
    },
    update: async function(req, res){
        console.log("inside update method of expense")
        const session_id = req.headers.authorization.split(' ')[1];
        if(session_id){
        const client = new MongoClient(uri)
        try{
            await client.connect();
            
            console.log("update item with id"+req.params.id)
            console.log("update item "+JSON.stringify(req.body))
            var id = new ObjectId(req.params.id);
            const query = { _id: id };
            const options = {
              // sort matched documents in descending order by rating
              sort: { date: 1 },
              // Include only the `title` and `imdb` fields in the returned document
              projection: { _id: 1, name: 1, amount: 1, date: 1 },
            };
            const newValue = { $set: {name: req.body.name, amount : req.body.amount, date: req.body.date}};
            console.log("report item with id"+req.params.id)
            databasesList = await client.db("finmgr").collection(session_id+"_entries").findOneAndUpdate(query,newValue, options);
            res.json(databasesList);
        }
        

        
        catch(e){
            console.error(e);
            res.status(500).send({
                message: e
             }); 

        }
        finally {   
            await client.close();
        }
        
         }
    else{
        res.status(403).send({
            message: 'Invalid User'
         }); 
    }
    },
    report: async function(req, res){
        const session_id = req.headers.authorization.split(' ')[1];
        if(session_id){
        console.log("inside report method of expense")
        const client = new MongoClient(uri)
        try{
            await client.connect();
            var searchId = req.params.id.trim();
            const query = { name: {$regex: new RegExp(searchId, "i") } };
            const options = {
              // sort matched documents in descending order by rating
              sort: { date: 1 },
              // Include only the `title` and `imdb` fields in the returned document
              projection: { _id: 1, name: 1, amount: 1, date: 1 },
            };
        
            console.log("report item with id"+req.params.id)
            databasesList = await client.db("finmgr").collection(session_id+"_entries").find(query, options).toArray();
            
            

        }
        catch(e){
            console.error(e);

        }
        finally {   
            await client.close();
        }
        res.json(databasesList);
    }
    else{
        res.status(403).send({
            message: 'Invalid User'
         }); 
    }
    }

}

module.exports = expense;