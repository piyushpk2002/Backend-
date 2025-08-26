import mongoose from "mongoose";

const companySchema = mongoose.Schema(
  {
    // owner: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User", // Reference to the User model
    //   required: true,
    // },
    primaryBusiness: { type: String },
    businessName: { type: String },
    address: { 
      street: { type: String },
      city: { type: String },
      state: { type: String }
    },
    location: {
      country: { type: String},
      city: { type: String },
    },
    website: { type: String },
    aboutCompany: { type: String },
    secondaryBusiness: [{ type: String }],
    serviceProducts: [{ type: String }],
    workingHour: {type: String},
    email: {type: String},
    phone: {type: String},

  },
  { timestamps: true }
);

// 📌 Add text index for smart search
companySchema.index({
  businessName: 'text',
  primaryBusiness: 'text',
  secondaryBusiness: 'text',
  serviceProducts: 'text',
  aboutCompany: 'text',
});

const Company = mongoose.model("Company", companySchema);
export default Company;
