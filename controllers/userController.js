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
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        // Check if password is correct
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const { accessToken, refreshToken } = await generateAccessTokensAndRefreshTokens(user._id);

        //store refreshTokens
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: false, // ✅ Only secure in production
            sameSite: "None" // ✅ Allow cross-site requests
        }

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({ user: loggedInUser,token: accessToken, message: "User logged in Successfully" });

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
            secure: true
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
    try {
        // Get the refresh token from cookies
        const incomingRefreshToken = req.cookies.refreshToken;
        
        if (!incomingRefreshToken) {
            console.log("No refresh token found");
            return res.status(401).json({ message: "No refresh token provided" });
        }
        
        console.log("Received Refresh Token:", incomingRefreshToken);

        // Verify the refresh token
        let decodedToken;
        try {
            decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
            console.log("Decoded Token:", decodedToken);
        } catch (error) {
            console.log("JWT Error:", error.message);
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }

        // Find user based on decoded token ID
        const user = await User.findById(decodedToken.id);
        if (!user) {
            console.log("User not found");
            return res.status(401).json({ message: "Invalid Refresh Token" });
        }

        // Check if the refresh token matches the one in the database
        if (incomingRefreshToken !== user.refreshToken) {
            console.log("Stored refresh token does not match incoming token");
            return res.status(401).json({ message: "Refresh Token expired or invalid" });
        }

        // Generate new access & refresh tokens
        const { accessToken, newRefreshToken } = await generateAccessTokensAndRefreshTokens(user._id);

        // Update the refresh token in the database
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        // Set cookies for new tokens
        const cookieOptions = { httpOnly: true, secure: true };
        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json({ message: "Access Token refreshed successfully" });

    } catch (error) {
        console.log("Error in refresh token:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



export {
    signupUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}