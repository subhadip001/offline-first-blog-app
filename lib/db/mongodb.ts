import { MongoClient, Db, Collection, Document } from "mongodb";
import { DBUser, DBPost, DBComment, Collections } from "./schemas";

if (!process.env.MONGO_URL) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGO_URL;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Helper functions to get typed collections
export async function getCollection<T extends Document>(
  name: string
): Promise<Collection<T>> {
  const client = await clientPromise;
  return client.db("offline-blog").collection<T>(name);
}

export async function getUsersCollection(): Promise<
  Collection<DBUser & Document>
> {
  return getCollection<DBUser & Document>(Collections.USERS);
}

export async function getPostsCollection(): Promise<
  Collection<DBPost & Document>
> {
  return getCollection<DBPost & Document>(Collections.POSTS);
}

export async function getCommentsCollection(): Promise<
  Collection<DBComment & Document>
> {
  return getCollection<DBComment & Document>(Collections.COMMENTS);
}

// Export clientPromise for use in other files
export default clientPromise;
