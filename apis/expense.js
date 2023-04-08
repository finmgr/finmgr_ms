const { MongoClient, ObjectId } = require('mongodb');
const admin = require('firebase-admin');
const request = require('request')
const { House } = require('./house');
const { async } = require('@firebase/util');
var serviceAccount = require("./key.json");
const { title } = require('process');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const uri = "mongodb+srv://ukencaph:ukencaph@enbits.4gilqgs.mongodb.net/?retryWrites=true&w=majority";

const TYPE = {
    ADD: "ADD",
    DELETE: "DELETE",
    UPDATE: "UPDATE"

}


var expense = {
    periodTransaction: async function (req, res) {
        const session_id = req.headers.authorization.split(' ')[1];
        if (session_id) {
            console.log("inside get method");
            const client = new MongoClient(uri);
            const startDate = req.params.sdate;
            const endDate = req.params.edate;
            try {
                const options = {
                    // sort matched documents in descending order by rating
                    sort: { date: 1 },
                    // Include only the `title` and `imdb` fields in the returned document
                    projection: { _id: 1, name: 1, amount: 1, date: 1 },
                };
                await client.connect();
                console.log(session_id + "_entries")
                databasesList = await client.db("finmgr").collection(session_id + "_entries").find({
                    date: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }, options).toArray();
                console.log(databasesList)
                // databasesList.databases.forEach(db => data.push(db));

            } catch (e) {
                console.error(e);
            }
            finally {
                await client.close();
            }

            res.json(databasesList);
        } else {
            res.status(403).send({
                message: 'Invalid User'
            });
        }
    },
    all: async function (req, res) {
        const session_id = req.headers.authorization.split(' ')[1];
        if (session_id) {
            console.log("inside get method");
            const client = new MongoClient(uri);
            const startDate = new Date(new Date(new Date().setHours(0, 0, 0, 0)).setDate(1));

            const endDate = new Date();
            endDate.setMonth(startDate.getMonth() + 1);
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
                console.log(session_id + "_entries")
                databasesList = await client.db("finmgr").collection(session_id + "_entries").find({
                    date: {
                        $gte: startDate.toISOString(),
                        $lt: endDate.toISOString()
                    }
                }, options).toArray();
                console.log(databasesList)
                // databasesList.databases.forEach(db => data.push(db));

            } catch (e) {
                console.error(e);
            }
            finally {
                await client.close();
            }

            res.json(databasesList);
        } else {
            res.status(403).send({
                message: 'Invalid User'
            });
        }
    },
    category: async function (req, res) {
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
        if (session_id) {
            const client = new MongoClient(uri);
            try {
                await client.connect();
                databasesList = await client.db("finmgr").collection(session_id + "_category").find().toArray();
                // databasesList.databases.forEach(db => data.push(db));

            } catch (err) {
                res.status(500).send({
                    message: 'Error Occured ' + err
                });
            }
            finally {
                await client.close();
            }

            res.json(databasesList);
        }
        else {
            res.status(403).send({
                message: 'Invalid User'
            });
        }

    },
    logUserIn: async function (req, res) {
        console.log("Starting user Log-in process");
        const client = new MongoClient(uri);
        try {
            await client.connect();
            const houseid = req.body.houseid;
            const password = req.body.password;
            const query = { houseid: houseid };
            const options = {

                // Include only the `title` and `imdb` fields in the returned document
                projection: { _id: 0, houseid: 1, password: 1 },
            };
            gettingUser = await client.db("finmgr").collection("users").findOne(query, options)
            if (gettingUser) {
                gettingUser['session_id'] = btoa(gettingUser.houseid + ":" + gettingUser.password);
            }
        }
        catch (err) {
            res.status(500).send({
                message: 'Error Occured ' + err
            });
        }
        finally {
            await client.close();
        }
        res.json(gettingUser);
    },
    registerUser: async function (req, res) {
        console.log("Starting user creation process");
        const client = new MongoClient(uri);
        try {
            await client.connect();
            const houseid = req.body.houseid;
            const password = req.body.password;
            const query = { houseid: houseid };
            const options = {
                // sort matched documents in descending order by rating
                sort: { date: 1 },
                // Include only the `title` and `imdb` fields in the returned document
                projection: { _id: 0, name: 1, amount: 1, date: 1 },
            };
            gettingUser = await client.db("finmgr").collection("users").findOne(query, options)
            if (gettingUser) {
                console.log("Another user found with same house id")
                res.status(400).send({
                    message: 'Duplicate HouseId please use another id'
                });
            }
            else {
                console.log("verified the entered house id is not registered... moving forward")
                createUser = await client.db("finmgr").collection("users").insertOne(req.body);
                if (createUser) {
                    console.log("creating collections");
                    const encryptedUser = btoa(houseid + ":" + password)
                    createdEntityTable = await client.db("finmgr").createCollection(encryptedUser + "_entity");
                    createdCategoryTable = await client.db("finmgr").createCollection(encryptedUser + "_category");
                    createdCategoryTable = await client.db("finmgr").createCollection(encryptedUser + "_finaccount");
                }
            }
        }
        catch (err) {
            res.status(500).send({
                message: 'Error Occured ' + err
            });
        }
        finally {
            await client.close();
        }
        res.json(createUser);
    },
    add: async function (req, res) {
        const session_id = req.headers.authorization.split(' ')[1];
        if (session_id) {
            console.log("inside POST method of adding expense")
            var reqPayload = req.body;
            reqPayload['name'] = reqPayload['name'].trim();
            const client = new MongoClient(uri)
            try {
                await client.connect();
                databasesList = await client.db("finmgr").collection(session_id + "_entries").insertOne(reqPayload);
                if (databasesList) {

                    initNotification(TYPE.ADD,reqPayload['name'],reqPayload['amount'],req.headers)
                }

            }
            catch (e) {
                console.error(e);

            }
            finally {
                await client.close();
            }
            res.json(databasesList);
        }
        else {
            res.status(403).send({
                message: 'Invalid User'
            });
        }
    },
    delete: async function (req, res) {
        console.log("inside delete method of expense")
        const session_id = req.headers.authorization.split(' ')[1];
        if (session_id) {
            const client = new MongoClient(uri)
            try {
                await client.connect();

                console.log("delete item with id" + req.params.id)
                var id = new ObjectId(req.params.id);
                const query = { _id: id };
                const options = {
                    // sort matched documents in descending order by rating
                    sort: { date: 1 },
                    // Include only the `title` and `imdb` fields in the returned document
                    projection: { _id: 1, name: 1, amount: 1, date: 1 },
                };

                console.log("report item with id" + req.params.id)
                databasesList = await client.db("finmgr").collection(session_id + "_entries").findOneAndDelete(query, options);
                if (databasesList) {

                    initNotification(TYPE.DELETE,"Expense","$$",req.headers)
                }
            }



            catch (e) {
                console.error(e);

            }
            finally {
                await client.close();
            }
            res.json(databasesList);
        }
        else {
            res.status(403).send({
                message: 'Invalid User'
            });
        }
    },
    update: async function (req, res) {
        console.log("inside update method of expense")
        const session_id = req.headers.authorization.split(' ')[1];
        if (session_id) {
            const client = new MongoClient(uri)
            try {
                await client.connect();

                console.log("update item with id" + req.params.id)
                console.log("update item " + JSON.stringify(req.body))
                var id = new ObjectId(req.params.id);
                const query = { _id: id };
                const options = {
                    // sort matched documents in descending order by rating
                    sort: { date: 1 },
                    // Include only the `title` and `imdb` fields in the returned document
                    projection: { _id: 1, name: 1, amount: 1, date: 1 },
                };
                const newValue = { $set: { name: req.body.name, amount: req.body.amount, date: req.body.date } };
                console.log("report item with id" + req.params.id)
                databasesList = await client.db("finmgr").collection(session_id + "_entries").findOneAndUpdate(query, newValue, options);
                if (databasesList) {

                    initNotification(TYPE.UPDATE,req.body.name,req.body.amount,req.headers)
                }
                res.json(databasesList);
            }



            catch (e) {
                console.error(e);
                res.status(500).send({
                    message: e
                });

            }
            finally {
                await client.close();
            }

        }
        else {
            res.status(403).send({
                message: 'Invalid User'
            });
        }
    },
    report: async function (req, res) {
        const session_id = req.headers.authorization.split(' ')[1];
        if (session_id) {
            console.log("inside report method of expense")
            const client = new MongoClient(uri)
            try {
                await client.connect();
                var searchId = req.params.id.trim();
                const query = { name: { $regex: new RegExp(searchId, "i") } };
                const options = {
                    // sort matched documents in descending order by rating
                    sort: { date: 1 },
                    // Include only the `title` and `imdb` fields in the returned document
                    projection: { _id: 1, name: 1, amount: 1, date: 1 },
                };

                console.log("report item with id" + req.params.id)
                databasesList = await client.db("finmgr").collection(session_id + "_entries").find(query, options).toArray();



            }
            catch (e) {
                console.error(e);

            }
            finally {
                await client.close();
            }
            res.json(databasesList);
        }
        else {
            res.status(403).send({
                message: 'Invalid User'
            });
        }
    },
    addToken: async function (req, res) {
        console.log("Starting user token registration process");
        const client = new MongoClient(uri);
        try {
            await client.connect();
            const houseid = req.params.id;
            const query = { houseid: houseid };
            const options = {

                // Include only the `title` and `imdb` fields in the returned document
                projection: { _id: 0, houseid: 1, password: 1 },
            };
            gettingUser = await client.db("finmgr").collection("users").findOne(query, options)
            if (gettingUser) {
                console.log("update user with token" + req.params.id)
                console.log("update item " + JSON.stringify(req.body))
                var id = req.params.id;
                const query = { houseid: id };
                const options = {
                    // sort matched documents in descending order by rating
                    sort: { date: 1 },
                    // Include only the `title` and `imdb` fields in the returned document
                    projection: { _id: 1, name: 1, amount: 1, date: 1 },
                };
                var devicetoken = gettingUser['token'] ? gettingUser['token'] : [];
                if (devicetoken.includes(req.params.token))
                    devicetoken.push(req.params.token)
                const newValue = { $set: { token: devicetoken } };

                databasesList = await client.db("finmgr").collection("users").findOneAndUpdate(query, newValue, options);
                res.send(devicetoken);

            }
        }
        catch (err) {
            res.status(500).send({
                message: 'Error Occured ' + err
            });
        }
        finally {
            await client.close();
        }
        // res.json(databasesList);
    }
  

}
function initNotification(type, item, amount, header){
    console.log("init Notification");
    const paylod = formMessage(type, item, amount);
    if(paylod){
        sendNotificationToDevice(paylod.title, paylod.message, header);
    }
    else{
        console.error("Notification Failed");
    }
}
function formMessage(type, item, amount) {
    console.log("forming notifcation message");
    var title = '';
    var message = '';
    switch (type) {
        case TYPE.ADD:
            title = "New Expense Recorded";
            message = item+" with amount of Rs. "+amount+" has been added."
            break;
        case TYPE.DELETE:
            title = "Existing Expense Deleted";
            message = item+" with amount of Rs. "+amount+" has been deleted."
            break;
            break;
        case TYPE.UPDATE:
            title = "Existing Expense Updated";
            message = item+" with amount of Rs. "+amount+" has been updated."
            break;
            break;
        default :
            title = "New Expense Recorded";
            message = "Activity on "+item+" with amount of Rs. "+amount+" has been recorded."
            break;
            
    }
    return {
        title : title,
        message : message
    }
}
function sendNotificationToDevice(title, message, headers) {
    const options = {
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: {
            'Authorization': 'key=AAAA0n5sQcU:APA91bEgw_YEmK_n4yVuKHzfVi2YuELQ9yzYZF4eSgYeXWnHbSVrl63oNp80KV3XD_4FAEAz1sdymtrE2ZaLYVvHC-25VUd5FKiQypphWsr2X7-BCThg9Bp_n9bNlcKMob8zl-ageS8b',
            'Content-Type': 'application/json'
        },
        json: {
            registration_ids: extractDeviceTokens(headers),
            notification: {
                title: title,
                body: message
            }
        }
    };
      request(options, function(error, response, body) {
            if (error) {
              console.error('Error sending notification:', error);
            } else if (response.statusCode >= 400) {
              console.error('HTTP Error:', response.statusCode, body);
            } else {
              console.log('Notification sent successfully:', body);
            }
          });
}
function extractDeviceTokens(headers) {
    var currentUserToken = headers.d;
    var houseTokens = headers.dl;
    if (houseTokens.includes(currentUserToken)) {
        houseTokens.splice(houseTokens.indexOf(currentUserToken), 1);
    }
    return houseTokens;
}

module.exports = expense;
