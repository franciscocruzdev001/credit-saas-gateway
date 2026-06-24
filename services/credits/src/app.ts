
import express, { Application }  from "express";
import { creditRouter } from "./routes/creditRoutes";
import cors from "cors";

const app: Application = express();
const PORT = process.env.PORT || 4001;


//habilita el cors 
app.use(cors());

// Built-in middleware to parse JSON bodies
app.use(express.json());

// Mount the router at your chosen base path prefix
app.use('/credits', creditRouter);

// Root fallback path
app.get("/", (_:any, res:any) => {
    res.json("Main Server Home Page");
});


app.listen(PORT, () => {
    console.log(`Credits service is running at PORT ${PORT}.`);
});
