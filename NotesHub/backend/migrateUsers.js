const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await User.updateMany({ isVerified: { $exists: false } }, { $set: { isVerified: true } });
  // Also verify users that might have been created recently but before we added this and have isVerified: false
  // Actually, only the ones with isVerified explicitly false and NO otp should be verified maybe?
  // Let's just update all where isVerified is false but they have no OTP.
  const result2 = await User.updateMany({ isVerified: false, otp: null }, { $set: { isVerified: true } });
  console.log('Updated existing users:', result.modifiedCount, result2.modifiedCount);
  process.exit();
});
