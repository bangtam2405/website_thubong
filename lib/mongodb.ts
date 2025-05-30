// lib/mongodb.ts
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string; // bạn có thể đặt trong .env.local
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error('Chưa có MONGODB_URI trong file .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // Trong môi trường dev, dùng biến toàn cục để không bị tạo lại client nhiều lần
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // Trong production, tạo client mới mỗi lần
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// lib/mongodb.ts
console.log("MongoDB URI:", process.env.MONGODB_URI);
