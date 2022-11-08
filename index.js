const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

require('dotenv').config();
const app = express();
const port = process.env.PROT || 5000

// middleware
app.use(cors());
app.use(express.json());



// password: psychologist
// user: rEusKmzaFYW7toMV




const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.acij04d.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const dbConnent = async () => {
    try {
        
        await client.connect();

    } catch (error) {
        console.log(error);
    }
}
dbConnent();

// database name
const service = client.db('psychologist').collection('service');

// service add server
app.post("/service", async (req, res) => {
    try {
        const result = await service.insertOne(req.body);
        if (result.insertedId) {
            res.send({
              success: true,
              message: `Successfully created the ${req.body.title}`,
            });
        }else {
            res.send({
              success: false,
              error: "Couldn't create the product",
            });
        }
    } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
    }
})

// service get 
app.get("/service", async(req,res)=>{
    try {
        const query = {};
        const cursor = service.find(query)
        const products = await cursor.limit(3).toArray();
        res.send({
            success: true,
            data: products,
            message: "Successfully got the data",
        });
        
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        });
    }
})

// all service get 
app.get("/serviceall", async(req,res)=>{
    try {
        const query = {};
        const cursor = service.find(query)
        const products = await cursor.toArray();
        res.send({
            success: true,
            data: products,
            message: "Successfully got the data",
        });
        
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        });
    }
})


// get id

app.get(`/serviceall/:id`,async(req,res)=>{
    try {
        const id = req.params.id;
        const query = {};
        const services = await service.findOne(query);
        res.send({
            success: true,
            data: services,
            message: "Successfully got the data",
        });
        
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        });
    }
})


// running server
app.get('/',(req,res)=>{
    res.send('Psychologist server is running')
})


// log listen
app.listen(port, () => {
    client.connect(err => {
        if (err) {
            console.log(err);
        }
        console.log('Mongodb connect');
       
    });
    console.log('volunteer server is running ' + port);
})