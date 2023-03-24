const {MongoClient} = require('mongodb');
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
        const startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        console.log(startDate.toISOString());
        console.log(endDate.toISOString());
        try {
            const options = {
                // sort matched documents in descending order by rating
                sort: { date: 1 },
                // Include only the `title` and `imdb` fields in the returned document
                projection: { _id: 0, name: 1, amount: 1, date: 1 },
              };
            await client.connect();
            console.log(session_id+"_entries")
            databasesList = await client.db("finmgr").collection(session_id+"_entries").find({date: {
                $gte: '2023-03-20T18:30:00.000Z',
                $lt: '2023-03-22T13:53:13.425Z'
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
        const client = new MongoClient(uri)
        try{
            await client.connect();
            databasesList = await client.db("finmgr").collection(session_id+"_entries").insertOne(req.body);
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
        const client = new MongoClient(uri)
        try{
            await client.connect();
            console.log("delete item with id"+req.params.id)
            databasesList = await client.db("finmgr").collection("entries").findOne({'_id':req.params.id});
            
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
    },
    report: async function(req, res){
        const session_id = req.headers.authorization.split(' ')[1];
        if(session_id){
        console.log("inside report method of expense")
        const client = new MongoClient(uri)
        try{
            await client.connect();
            const query = { name: req.params.id };
            const options = {
              // sort matched documents in descending order by rating
              sort: { date: 1 },
              // Include only the `title` and `imdb` fields in the returned document
              projection: { _id: 0, name: 1, amount: 1, date: 1 },
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