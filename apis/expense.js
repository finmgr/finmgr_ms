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
        console.log("inside get method");
        const client = new MongoClient(uri);
        try {
            const options = {
                // sort matched documents in descending order by rating
                sort: { date: 1 },
                // Include only the `title` and `imdb` fields in the returned document
                projection: { _id: 0, name: 1, amount: 1, date: 1 },
              };
            await client.connect();
            databasesList = await client.db("finmgr").collection("entries").find({}, options).toArray();
           // databasesList.databases.forEach(db => data.push(db));
         
        } catch (e) {
            console.error(e);
        }
        finally {
            await client.close();
        }
    
        res.json(databasesList); 
    },
    category: async function(req,res){ 
        console.log("inside get method");
        const client = new MongoClient(uri);
        try {
            await client.connect();
            databasesList = await client.db("finmgr").collection("category").find().toArray();
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
            databasesList = await client.db("finmgr").collection("entries").find(query, options).toArray();
            
            

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