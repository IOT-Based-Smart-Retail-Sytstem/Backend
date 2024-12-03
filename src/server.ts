import server from './app';
import mongoose from 'mongoose';

const port = process.env.PORT as string;

mongoose
  .connect(process.env.MONGO_URL as string)
  .then(() => server.listen(port))
  .then(() => console.log(`connect to mongoDb and listen on port ${port}`))
  .catch((err: any) => console.log(err));
