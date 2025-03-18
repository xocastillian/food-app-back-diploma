import * as mongoose from 'mongoose';
import { UserSchema } from '../users/schemas/user.schema';

async function runMigration() {
  await mongoose.connect(
    process.env.MONGO_URI || 'mongodb://localhost:27017/food-app',
  );

  const UserModel = mongoose.model('User', UserSchema);
  const result = await UserModel.updateMany(
    { orders: { $exists: false } },
    { $set: { orders: [] } },
  );

  console.log('Migration completed. Modified count:', result.modifiedCount);
  await mongoose.disconnect();
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
