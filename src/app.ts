import express from "express";
import db from "./config/db-config";
import swaggerOptions from "./docs/head";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import router from "./router/router";

const swaggerDocs = swaggerJSDoc(swaggerOptions);

function createApp() {
    const app = express();
    app.use(express.json());
    app.get('/', (req, res) => {
        res.redirect('/docs');
    });

    app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

    app.use('/', router);

    return app;
}

function connect_db() {
    db.on('error', (error) => console.log("Database connection error:", error));
    db.once('open', () => {
        console.log('🎲 Connected to database OK!');
    });
}

export { createApp, connect_db };

