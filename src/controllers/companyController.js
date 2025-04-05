import Company from '../models/BuisnessModel.js'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { upload } from '../middleware/multer.middleware.js'

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
        await business.save({validateBeforeSave: false});
        res.status(201).json({ business, message: "Business listed successfully" });

    } catch (error) {
        console.log("Error in listing business:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


export const getBusinessByCategory = async (req, res) => {
    try {
        let { primaryBusiness } = req.params;
        console.log(primaryBusiness);
        
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
 * 
 */

export const searchProducts = async (req, res) => {
  try {
    // Get primaryBusiness query parameter
    let { primaryBusiness } = req.query;
    console.log("Primary Business:", primaryBusiness);

    // If primaryBusiness is passed as an array (e.g. from URL), turn it into a string
    if (Array.isArray(primaryBusiness)) {
      primaryBusiness = primaryBusiness[0]; // Get the first element if it's an array
    }

    if (!primaryBusiness) {
      return res.status(400).json({
        success: false,
        message: 'Primary business parameter is missing'
      });
    }

    // Prepare the query with case-insensitive search
    const searchCriteria = primaryBusiness ? primaryBusiness : '';
    
    const query = {
      $or: [
        { primaryBusiness: { $regex: searchCriteria, $options: 'i' } },
        { businessName: { $regex: searchCriteria, $options: 'i' } }
      ]
    };

    // Execute the search
    const products = await Company.find(query);
    console.log("Products found:", products);

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


