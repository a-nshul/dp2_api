const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { roles ,gender,MaritalStatus,Visibility,
  AmenityTypes,ReligionCaste,HeightWeight,DietaryPreferences,
  HobbiesAndInterests,FamilyDetails,PropertyOwnership,BuySellRent} = require("../config/roles");
// Personal Details Schema
const personalDetailsSchema = {
  fullName: { type: String, required: false },
  dateOfBirth: { type: Date, required: false },
  gender: { type: String, required: false ,enum:Object.values(gender) },
  profilePhoto: { type: String, required: false }, 
};

// Contact Information Schema
const contactInformationSchema = {
  email: { type: String, 
    unique: true, // Ensure uniqueness
    sparse: true, // Allow multiple null values
    trim: true, 
  },
  secondaryEmail: { type: String },
};

// Address Details Schema
const addressDetailsSchema = {
  currentAddress: { type: String, required: false },
  permanentAddress: { type: String, required: false },
  city: { type: String, required: false },
  state: { type: String, required: false },
  country: { type: String, required: false },
  zipPostalCode: { type: String, required: false },
  landmark: { type: String }, 
};

// Professional Details Schema
const professionalDetailsSchema = {
  currentJobDetails: { type: String, required: false },
  employerCompanyName: { type: String, required: false },
  workExperience: { type: Number, required: false }, 
  skillsAndCertifications: { type: [String] }, 
  languagesKnown: { type: [String] },
  educationHistory: [
    {
      degreeEarned: { type: String },
      educationalAttended: { type: String },
      yearOfGraduation: { type: String },
    },
  ],
  roleAndResponsibilities: { type: String },
  previousEmployers: [
    {
      employerName: { type: String },
      duration: {
        startDate: { type: Date },
        endDate: { type: Date },
      },
    },
  ],
};
// Matrimony Details Schema
const matrimonyDetailsSchema = {
    maritalStatus: { type: String, required: false ,enum:Object.values(MaritalStatus) },
    religionCaste: { type: String, required: false ,enum:Object.values(ReligionCaste) },
    heightWeight: { type: String, required: false,enum:Object.values(HeightWeight) }, 
    dietaryPreferences: { type: String ,enum:Object.values(DietaryPreferences) },
    hobbiesAndInterests: { type: [String] ,enum:Object.values(HobbiesAndInterests) },
    familyDetails: {
      parentsOccupation: { type: String ,enum:Object.values(FamilyDetails) },
      siblings: { type: String },
    },
    preferredPartnerDetails: {
      maritalStatus: { type: String },
      ageRange: { type: String },
      height: { type: String },
      religionCaste: { type: String },
      location: { type: String },
      preferences: { type: String },
    },
  };
  
  // Property Details Schema
  const propertyDetailsSchema = {
    propertyOwnership: { type: String ,enum:Object.values(PropertyOwnership) }, 
    lookingToBuySellRent: { type: String ,enum:Object.values(BuySellRent)}, 
    budgetRange: { type: String },
    preferredLocations: { type: String },
    propertySpecifications: {
      type: { type: String }, 
      size: { type: String }, 
      amenities: { type: [String] ,enum:Object.values(AmenityTypes) },
    },
  };
  
  // Additional Features for Portals Schema
  const additionalFeaturesSchema = {
    qrCodeForProfileAccess: { type: String }, 
    publicPrivateVisibility: { type: String, enum: Object.values(Visibility), default: 'Private' },
    dynamicSharingPermissions: { type: [String] }, 
  };
  
  // Document Uploads Schema
  const documentUploadsSchema = {
    resume: { type: String }, 
    idProof: { type: String }, 
    addressProof: { type: String }, 
  };
const userSchema = mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    personalDetails: personalDetailsSchema,
    contactInformation: contactInformationSchema,
    addressDetails: addressDetailsSchema,
    professionalDetails: professionalDetailsSchema,
    matrimonyDetails: matrimonyDetailsSchema,
    propertyDetails: propertyDetailsSchema,
    additionalFeatures: additionalFeaturesSchema,
    documentUploads: documentUploadsSchema,
    password: { type: String, required: false },
    mobileno:{
      type:String,
      unique: true,
      required: false,
      trim: true,
    }
  },
  { timestamps: true }
);

// Match password method for user login authentication
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving user model
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
