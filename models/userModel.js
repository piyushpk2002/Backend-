import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true,
        unique: true
    },
    userType: {
        type: String,
        required: true,
        enum: ["Customer", "Admin"],
        default: "Customer",
    },
    refreshToken: {
        type: String,
    }
},
//createdAt, updatedAt
{
    timestamps: true
});



//for hashing the password Pre save hook middleware to hash the password before saving the user
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")){
        next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

//compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//Authentication

//generate Jwt tokens
userSchema.methods.generateAccessTokens = function () {
    return jwt.sign({
        id: this._id,
        email: this.email,
        username: this.username,
        name: this.name
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m"})
};

userSchema.methods.generateRefreshTokens = function () {
    return jwt.sign({
        id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "7d"})
};

const User = mongoose.model("User", userSchema);

export default User;