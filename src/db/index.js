const mongoose = require("mongoose");

const connectDb = async () => {
	try {
		const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}crm`);
		console.log(`MongoDb connection: || DB HOST:  ${connectionInstance.connection.host}`);
	} catch (error) {
		console.error("Error...." + error);
		process.exit(1);
	}
};

module.exports = connectDb;
