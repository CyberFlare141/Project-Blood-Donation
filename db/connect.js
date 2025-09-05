const mongoose= require("mongoose");

uri= "mongodb+srv://samiulsami1100_db_user:YDY7hUi0X3BOzVnI@projectbloodapi.kbx6oev.mongodb.net/ProjectBloodAPI?retryWrites=true&w=majority&appName=ProjectBloodAPI";

const connectDB = () => {
    return mongoose.connect(uri,options,callback)
}