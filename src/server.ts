import server from './app';
import mongoose from 'mongoose';

if (!process.env.PORT || !process.env.MONGO_URL) {
  console.error('Missing required environment variables: PORT or MONGO_URL');
  process.exit(1); // Exit with an error code
}

const port = process.env.PORT as string;
const mongoUrl = process.env.MONGO_URL as string;

mongoose
  .connect(mongoUrl)
  .then(() => server.listen(port))
  .then(() => console.log(`Connected to MongoDB and listening on port ${port}`))
  .catch((err: any) => console.log('Error connecting to MongoDB:', err));

