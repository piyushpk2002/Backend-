import User from '../models/userModel.js';
import jwt from 'jsonwebtoken'




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
        const { name, username, email, password, mobile, location, company, userType } = req.body;
        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name, username, email, password, mobile, location, company, userType
        });
        res.status(201).json({ user, message: "User created successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        // Check if user exists
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "User not found"});
        }
        // Check if password is correct
        const isPasswordCorrect = await user.comparePassword(password);

        if(!isPasswordCorrect){
            res.status(400).json({message: "Invalid Credentials"});
        }

        const {accessToken, refreshToken} = await generateAccessTokensAndRefreshTokens(user._id);

        //store refreshTokens
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({ user: loggedInUser, message: "User logged in Successfully" });

    } catch (error) {
        console.log("Error in login controller");
        
        res.status(500).json({ message: error.message });
    }
}

const logoutUser = async (req, res) => {
    
    try {

        const accessToken = req.cookies.accessToken;

        if(!accessToken){
            console.log("cookie not found");
           return  res.status(401).
            json({message: "Unauthorized request"});
        }
    
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        if(!decoded){
            return res.status(401).
            json({message: "Unauthorized request"});
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

const refreshAccessToken = async (req, res) =>{

    const incomingRefreshToken = req.cookies.refreshToken
    
    if(!incomingRefreshToken){
        console.log("No refresh Token");
        
      return res.status(401).json({message: "No refresh token"})
    }
    console.log("here");
    
    try {
      //decode tokens
      //console.log("here23");
      
      

const token = "your_refresh_token_here";
const secret = process.env.REFRESH_TOKEN_SECRET;

try {
    const decoded = jwt.verify(token, secret);
    console.log("Decoded:", decoded);
} catch (error) {
    console.log("JWT Error:", error.message);
}
        console.log(decodedToken);
        
      const user = await User.findById(decodedToken?.id)

      if(!user){
        console.log("no user found");
        return res.status(401).json({message: "Invalid Refresh Token"});
      }
      console.log("here2");
      

      //match tokens from the db and frontend
      if(incomingRefreshToken !== user?.refreshToken){
        console.log("refresh token expired");
        
        return res.status(401).json({message: "Refresh Token expired or used"});
      }

      const options = {
        httpOnly: true,
        secure: true
      }
      //generating new access tokens
      const {accessToken, newRefreshToken} = await generateAccessTokensAndRefreshTokens(user._id)

      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        {
            message: "Access Token refreshed successfully" 
        }
        )
    } catch (error) {
        return res.status(401).json({message: "Invalid Refresh Token"});
      }
  }
    


export  {
    signupUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}
