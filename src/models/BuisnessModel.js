import mongoose from "mongoose";

const companySchema = mongoose.Schema(
  {
    // owner: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User", // Reference to the User model
    //   required: true,
    // },
    primaryBusiness: { type: String, required: true },
    businessName: { type: String, required: true },
    address: { 
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
    },
    location: {
      country: { type: String, required: true },
      city: { type: String },
    },
    website: { type: String, required: true },
    aboutCompany: { type: String },
    secondaryBusiness: { type: String },
    serviceProducts: { type: String },
    workingHour: {type: String},
    email: {type: String},
    phone: {type: String},

  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);
export default Company;
