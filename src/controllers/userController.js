import User from '../models/userModel.js';
import jwt from 'jsonwebtoken'
// import bcrypt from "bcryptjs";




const generateAccessTokensAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const accessToken = await user.generateAccessTokens(userId);
        const refreshToken = await user.generateRefreshTokens(userId);
        
        
        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };

    } catch (error) {
        throw new Error("Error generating tokens: " + error.message);
    }


}
const signupUser = async (req, res) => {
    try {
        const { name, email, password, mobile, userType } = req.body;
        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name, email, password, mobile, userType
        });
        res.status(201).json({ user, message: "User created successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const { accessToken, refreshToken } = await generateAccessTokensAndRefreshTokens(user._id);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            path: "/",               
            httpOnly: false,         
            secure: false,           
            sameSite: "Lax",
        }
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({ user: loggedInUser,token: accessToken,userType: user.userType, message: "User logged in Successfully" });

    } catch (error) {
        console.log("Error in login controller");

        res.status(500).json({ message: error.message });
    }
}

const logoutUser = async (req, res) => {

    try {

        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            console.log("cookie not found");
            return res.status(401).
                json({ message: "Unauthorized request" });
        }

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) {
            return res.status(401).
                json({ message: "Unauthorized request" });
        }

        await User.findByIdAndUpdate(decoded.id,
            {
                $unset: {
                    refreshToken: 1
                }
            },
            {
                new: true
            }
        );

        const options = {
            httpOnly: true,
            secure: false
        }

        return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({ message: "User logged out successfully" });

    } catch (error) {
        console.log("Error in logout");

        res.status(500).json({ message: error.message });
    }
}


const refreshAccessToken = async (req, res) => {
   const incomingRefreshToken = req.cookies.refreshToken;
   //console.log("Incoming refresh token:", incomingRefreshToken);
   

   const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
   if (!decoded) {
       return res.status(401).json({ message: "Unauthorized request" });
   }

   const user = await User.findById(decoded.id);
   console.log(user);
   

   if(!user){
         return res.status(401).json({ message: "Unauthorized request" });
    }

    const {accessToken, refreshToken} = await generateAccessTokensAndRefreshTokens(user._id);
    
    const options = {
        httpOnly: false,
        secure: false
    }
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({ message: "New access token generated successfully" });

};



export {
    signupUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}