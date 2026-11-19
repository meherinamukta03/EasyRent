import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient("");
const db = client.db("EasyReant");

export const auth = betterAuth({


        baseURL: process.env.BETTER_AUTH_URL, 
 emailAndPassword: { 
    enabled: true, 
  }, 

  database: mongodbAdapter(db, {
    client,
  }),
   socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
});