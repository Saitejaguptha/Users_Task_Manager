const mongoose = require("mongoose");
url = process.env.MONGOOSE_URL;

mongoose.connect(url);
