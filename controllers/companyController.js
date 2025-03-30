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
    //     console.log("here");

    //     // Extract access token from cookies
    //     let accessToken = req.cookies.refreshToken;
    //     //let refreshToken = req.cookies.refreshToken
    //     //console.log(refreshToken);
        
    //    // console.log("here2");

    //     if (!accessToken) {
    //         console.log("Access token not provided");
    //         return res.status(401).json({ message: "Unauthorized: No token provided" });
    //     }
        
    //     let decodedToken;
    //     try {
    //         decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    //     } catch (error) {
    //         //  If token expired, try to refresh it
    //         if (error.name === "TokenExpiredError") {
    //             console.log("Access token expired, attempting refresh...");

    //             // const refreshToken = refreshToken;
    //             if (!refreshToken) {
    //                 console.log("No refresh token found");
    //                 return res.status(403).json({ message: "Unauthorized: Refresh token missing" });
    //             }

    //             try {
    //                 // Call refresh endpoint
    //                 console.log("herer");
                    
    //                 const refreshResponse = await axios.post(
    //                     "http://localhost:5000/api/users/refreshAccessToken", 
    //                     {}, 
    //                     { withCredentials: true }
    //                 );
    //                 //console.log("ttttt",refreshResponse);
                    
    //                 accessToken = refreshResponse.data.accessToken;
    //                 console.log("New access token received:", accessToken);
    //             } catch (refreshError) {
    //                 console.log("Failed to refresh token:", refreshError.message);
    //                 return res.status(403).json({ message: "Unauthorized: Refresh failed" });
    //             }
    //         } else {
    //             console.log("Invalid token:", error.message);
    //             return res.status(403).json({ message: "Forbidden: Invalid token" });
    //         }
    //     }

    //     console.log("here3");

    //     // Extract owner ID from decoded token
    //     const owner = decodedToken.id;
    //     console.log(owner);

    //     if (!owner) {
    //         console.log("Owner not provided in token");
    //         return res.status(400).json({ message: "Owner not found in token" });
    //     }

        // Create business with owner reference
        const business = await Company.create({
            //owner,
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
        let { primaryBusiness } = req.params;
        primaryBusiness = decodeURIComponent(primaryBusiness); // Decode URL parameter
        console.log("Requested Category:", primaryBusiness);

        const companies = await Company.find({ primaryBusiness });

        if (companies.length === 0) {
            return res.status(404).json({ message: "No businesses found for this category." });
        }

        res.status(200).json(companies);
    } catch (error) {
        console.log("Error in getting the businesses:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


/**
 * Search for products based on query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    // Create a search pattern for MongoDB using regex
    // This will match products where the name or description contains the query (case insensitive)
    const searchPattern = new RegExp(query, 'i');
    
    const products = await Company.find({
      $or: [
        { name: searchPattern },
        { description: searchPattern },
        // Add more fields to search as needed
      ]
    }).limit(20); // Limiting results for performance
    
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while performing search',
      error: error.message
    });
  }
};


