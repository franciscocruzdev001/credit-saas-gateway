import dotenv from 'dotenv';
import "reflect-metadata";
import express, { Application } from "express";
import { authRouter } from "./routes/authorizerRoutes";
import cors from "cors";

dotenv.config();
const app: Application = express();
const PORT = Number(process.env.AUTHORIZER_PORT) || 4000;

// CORS - permite requests desde el frontend
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? '*', // en dev puedes dejar '*' o listar orígenes
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));


// Built-in middleware to parse JSON bodies
app.use(express.json());

// Mount the router at your chosen base path prefix
app.use('/authorizer', authRouter);


//authorizer fetched.
// Root fallback path
app.get("/", (_: any, res: any) => {
    res.json("Main Server Home Page");
});



app.listen(PORT, '0.0.0.0', () => {
    console.log(`Authorizer service is running at PORT ${PORT}.`);
});