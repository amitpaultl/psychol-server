const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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

// jwt verifyJwt
function verifyJwt(req,res,next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.send('unauthorize access')
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,function(err, decoded){
        if(err){
           return res.send('unauthorize access')
        }
        req.decoded = decoded;
        next()
    });
}

// db connent

const dbConnent = async () => {
    try {
        
        await client.connect();

        app.post('/jwt',(req,res)=>{
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user , process.env.ACCESS_TOKEN_SECRET,{expiresIn:'7d'});
            res.send({token})
        })

    } catch (error) {
        console.log(error);
    }
}
dbConnent();

// database name
const service = client.db('psychologist').collection('service');
const review = client.db('psychologist').collection('review');

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
        const services = await service.findOne({_id:ObjectId(id)});
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


// review add server
app.post("/review", async (req, res) => {
    try {
        const result = await review.insertOne(req.body);
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


// review get 
app.get("/review",verifyJwt, async(req,res)=>{
    try {
        // jwt 
        const email = req.query.email;
        const decoded = req.decoded;
        if(decoded.email !== email){
            res.send({message:'unauthorize access'})
        }

        
        const query = {};
        const cursor = review.find(query)   
        const user = await cursor.toArray();
        const products = user.filter((p) => p.email == email);
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

// // all review  get 
app.get("/reviewdis",  async(req,res)=>{
    try {
        const id = req.query.id;
        const query = {};
        const cursor = review.find(query)   
        const user = await cursor.toArray();
        const products = user.filter((p) => p.product._id == id);

        const revers = products.reverse()

     
        res.send({
            success: true,
            data: revers,
            message: "Successfully got the data",
        });
        
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        });
    }
})

// get id review

app.get(`/review/:id`,async(req,res)=>{
    try {
        const id = req.params.id;
        const services = await review.findOne({_id:ObjectId(id)});
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


// delete review

app.delete('/review/:id', async(req,res)=>{
    
    try {
        const id = req.params.id;
        const query = {_id: ObjectId(id)}
        
        const result = await review.deleteOne(query);
       
        if(result.deletedCount){
            res.send({
                success : true,
                message: `Successfully delete `
            })
            
        }
        
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
          });

    }

})

// update review
app.patch(`/review/:id`,async (req,res)=>{
    try {
        const id = req.params.id;
        const status = req.body;
        // const update : {$set : status};
        const filter = {_id : ObjectId(id)}
        const result = await review.updateOne(filter, {$set : status})
        res.send({
            success : true,
            data: result
        })
        
    } catch (error) {
        res.send({
            success: false,
            error: error.message

        })
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