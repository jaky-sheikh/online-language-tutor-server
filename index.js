const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gi5sj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");


        // language card collection
        const lanCardCollection = client.db("online-Tutor").collection("lanCard");

        // Booked tutors collection
        const bookedTutorsCollection = client.db("online-Tutor").collection("bookedTutors");

        // language card get operation
        app.get('/lanCard', async (req, res) => {
            const result = await lanCardCollection.find().toArray();
            res.send(result);
        })

        // find tutor get api by category
        app.get("/tutors/:category", async (req, res) => {
            const category = req.params.category.split(" ")[0];
            const result = await tutorsCollection.find({ language: category }).toArray();
            res.send(result);
        })

        // tutors get operation for all
        // app.get("/tutors", async (req, res) => {
        //     const result = await tutorsCollection.find().toArray();
        //     res.send(result);
        // })

        // Single tutor details fetch route get operation
        app.get("/tutor/:id", async (req, res) => {
            const id = req.params.id;
            const result = await tutorsCollection.findOne({ _id: new ObjectId(id) });
            res.send(result);
        })

        // My Booked Tutors Data Get API
        app.get("/booked-tutors", async (req, res) => {
            const email = req.query.email;
            const result = await bookedTutorsCollection.find({ email }).toArray();
            res.send(result);
        })

        // tutors get api for my-tutorial 
        // app.get("/tutors", async (req, res) => {
        //     const email = req.query.email;
        //     let query = {};
        //     if (email) {
        //         query = { email: email };
        //     }
        //     const result = await tutorsCollection.find(query).toArray();
        //     res.send(result);
        // })


        // get api for update page(definite id)
        app.get("/tutors/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await tutorsCollection.findOne(query);
            res.send(result);
        })

        // tutors get operation with optional search
        app.get("/tutors", async (req, res) => {
            const email = req.query.email;
            const search = req.query.search;
            let query = {};

            if (email) {
                query.email = email;
            }

            if (search) {
                query.language = { $regex: search, $options: "i" };
            }

            const result = await tutorsCollection.find(query).toArray();
            res.send(result);
        });


        // delete api for update page
        app.delete("/tutors/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await tutorsCollection.deleteOne(query);
            res.send(result);
        })

        // update api for update page
        app.put('/tutors/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;

            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    image: updatedData.image,
                    language: updatedData.language,
                    price: updatedData.price,
                    details: updatedData.details,
                },
            };

            const result = await tutorsCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // tutors post operation
        app.post("/tutors", async (req, res) => {
            const newTutors = req.body;
            const result = await tutorsCollection.insertOne(newTutors);
            res.send(result);
        })

        // booked-tutors post operation
        app.post("/booked-tutors", async (req, res) => {
            const bookedTutorInfo = req.body;
            const result = await bookedTutorsCollection.insertOne(bookedTutorInfo);
            res.send(result);
        })

        // Review Count Update API (using $inc operator)

        // app.post("/add-review", async (req, res) => {
        //     const reviewData = req.body;

        //     try {
        //         const reviewResult = await reviewsCollection.insertOne(reviewData);

        //         const tutorUpdateResult = await tutorsCollection.updateOne(
        //             { _id: new ObjectId(reviewData.tutorId) },
        //             { $inc: { reviewCount: 1 } }
        //         );

        //         res.send({
        //             reviewInserted: reviewResult.insertedId,
        //             tutorUpdated: tutorUpdateResult.modifiedCount > 0
        //         });
        //     } catch (error) {
        //         res.status(500).send({ error: error.message });
        //     }
        // });

        app.get("/tutors/review/:id", async (req, res) => {
            const id = req.params.id;
            const result = await tutorsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $inc: { review: 1 } }
            );

            await reviewsCollection.insertOne({});
            res.send(result);
        })

        app.post("/add-review", async (req, res) => {
            const reviewData = req.body;
            const result = await reviewsCollection.insertOne(reviewData);
            res.send(result);
        });


        // for stat crud operation
        const db = client.db("online-Tutor");
        const tutorsCollection = db.collection("tutors");
        const reviewsCollection = db.collection("reviews");
        const languagesCollection = db.collection("languages");
        const usersCollection = db.collection("users");

        // tutors crud
        app.post('/tutors', async (req, res) => {
            const result = await tutorsCollection.insertOne(req.body);
            res.send(result);
        })

        app.get('/tutors', async (req, res) => {
            const result = await tutorsCollection.find().toArray();
            res.send(result);
        })

        app.put("/tutors/:id", async (req, res) => {
            const id = req.params.id;
            const updatedTutor = req.body;
            const result = await tutorsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedTutor }
            );
            res.send(result);
        });

        app.delete("/tutors/:id", async (req, res) => {
            const id = req.params.id;
            const result = await tutorsCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        // reviews crud
        // app.post("/reviews", async (req, res) => {
        //     const result = await reviewsCollection.insertOne(req.body);
        //     res.send(result);
        // });

        // app.get("/reviews", async (req, res) => {
        //     const result = await reviewsCollection.find().toArray();
        //     res.send(result);
        // });

        // app.put("/reviews/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const updatedReview = req.body;
        //     const result = await reviewsCollection.updateOne(
        //         { _id: new ObjectId(id) },
        //         { $set: updatedReview }
        //     );
        //     res.send(result);
        // });

        // app.delete("/reviews/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const result = await reviewsCollection.deleteOne({ _id: new ObjectId(id) });
        //     res.send(result);
        // });

        // languages crud
        app.post("/languages", async (req, res) => {
            const result = await languagesCollection.insertOne(req.body);
            res.send(result);
        });

        app.get("/languages", async (req, res) => {
            const result = await languagesCollection.find().toArray();
            res.send(result);
        });

        app.put("/languages/:id", async (req, res) => {
            const id = req.params.id;
            const updatedLanguage = req.body;
            const result = await languagesCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedLanguage }
            );
            res.send(result);
        });

        app.delete("/languages/:id", async (req, res) => {
            const id = req.params.id;
            const result = await languagesCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        // users crud (Register)
        app.post("/users", async (req, res) => {
            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser);
            res.send(result);
        });

        app.get("/users", async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });

        // app.put("/users/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const updatedUser = req.body;
        //     const result = await usersCollection.updateOne(
        //         { _id: new ObjectId(id) },
        //         { $set: updatedUser }
        //     );
        //     res.send(result);
        // });

        // app.delete("/users/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
        //     res.send(result);
        // });

        // stats API
        app.get("/stats", async (req, res) => {
            const tutorCount = await tutorsCollection.countDocuments();
            const reviewCount = await reviewsCollection.countDocuments();
            const languageCount = await languagesCollection.countDocuments();
            const userCount = await usersCollection.countDocuments();

            res.send({ tutorCount, reviewCount, languageCount, userCount });
        });


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Online tutors are here')
})

app.listen(port, () => {
    console.log(`Tutor is waiting at : ${port}`)
})