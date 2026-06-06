
import express, { Application }  from "express";

const app: Application = express();
const PORT = process.env.PORT || 4003;


// Built-in middleware to parse JSON bodies
app.use(express.json());

// Mount the router at your chosen base path prefix
//app.use('/transactions', authRouter);

//authorizer fetched.
// Root fallback path
app.get("/", (_:any, res:any) => {
    res.json("Main Server Home Page");
});



app.listen(PORT, () => {
    console.log(`Transactions service is running at PORT ${PORT}.`);
});
