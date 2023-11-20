const mongoose = require('mongoose')


//connect to db

const connectDB = async () => {
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        };
        await mongoose.connect(process.env.MONGO_URL, options);
        console.log('DB has been connected');
    } catch (error) {
        console.log('DB connection failed', error.message);
    }
}


module.exports = connectDB