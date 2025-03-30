import Company from '../models/BuisnessModel.js'
import jwt from 'jsonwebtoken'
import axios from 'axios'

export const getAllBusiness = async (req, res) => {
    try {
        //return all the Businesses
        const companies = await Company.find({});
    } catch (error) {
        console.log("Error in getting all the business", error.message);
        res.status(500).json({message: "Server Error", error: error.message});
    }
}




export const listBusiness = async (req, res) => {
    try {
        console.log("here");

        // Extract access token from cookies
        let accessToken = req.cookies.refreshToken;
        //let refreshToken = req.cookies.refreshToken
        //console.log(refreshToken);
        
       // console.log("here2");

        if (!accessToken) {
            console.log("Access token not provided");
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        
        let decodedToken;
        try {
            decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            //  If token expired, try to refresh it
            if (error.name === "TokenExpiredError") {
                console.log("Access token expired, attempting refresh...");

                // const refreshToken = refreshToken;
                if (!refreshToken) {
                    console.log("No refresh token found");
                    return res.status(403).json({ message: "Unauthorized: Refresh token missing" });
                }

                try {
                    // Call refresh endpoint
                    console.log("herer");
                    
                    const refreshResponse = await axios.post(
                        "http://localhost:5000/api/users/refreshAccessToken", 
                        {}, 
                        { withCredentials: true }
                    );
                    //console.log("ttttt",refreshResponse);
                    
                    accessToken = refreshResponse.data.accessToken;
                    console.log("New access token received:", accessToken);
                } catch (refreshError) {
                    console.log("Failed to refresh token:", refreshError.message);
                    return res.status(403).json({ message: "Unauthorized: Refresh failed" });
                }
            } else {
                console.log("Invalid token:", error.message);
                return res.status(403).json({ message: "Forbidden: Invalid token" });
            }
        }

        console.log("here3");

        // Extract owner ID from decoded token
        const owner = decodedToken.id;
        console.log(owner);

        if (!owner) {
            console.log("Owner not provided in token");
            return res.status(400).json({ message: "Owner not found in token" });
        }

        // Create business with owner reference
        const business = await Company.create({
            owner,
            primaryBusiness: req.body.primaryBusiness,
            businessName: req.body.businessName,
            address: req.body.address,
            location: req.body.location,
            website: req.body.website,
            aboutCompany: req.body.aboutCompany,
            secondaryBusiness: req.body.secondaryBusiness,
            serviceProducts: req.body.serviceProducts
        });

        res.status(201).json({ business, message: "Business listed successfully" });

    } catch (error) {
        console.log("Error in listing business:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


export const getBusinessByCategory = async (req, res) => {
    try {
        //return all the Businesses
        const {primaryBusiness} = req.params
        const companies = await Company.find({primaryBusiness});
    } catch (error) {
        console.log("Error in getting the businesses", error.message);
        res.status(500).json({message: "Server Error", error: error.message});
    }
}