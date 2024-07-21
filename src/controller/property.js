import Property from "../model/property.js";
import { cloudinary } from "../helpers/cloudinary.config.js";
import slugify from "slugify";

export const createProperty = async (req, res) => {
  try {
    const { title, description, price, location, bedroom, bathroom, tag} = req.body;
    const imageFiles = req.files;

    // Validate required fields
    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "title is required" });
    }
    if (!description) {
      return res
        .status(400)
        .json({ success: false, message: "description is required" });
    }
    if (!price) {
      return res
        .status(400)
        .json({ success: false, message: "price is required" });
    }
    if (!location) {
      return res
        .status(400)
        .json({ success: false, message: "location is required" });
    }

    // Generate slug from title
    const slug = slugify(title);

    // Upload images to Cloudinary and store their URLs and public IDs
    let uploadedImages = [];
    if (imageFiles && imageFiles.length > 0) {
      uploadedImages = await Promise.all(
        imageFiles.map(async (file) => {
          try {
            const imageResult = await cloudinary.uploader.upload(file.path);
            return {
              url: imageResult.secure_url,
              imagePublicId: imageResult.public_id,
            };
          } catch (err) {
            console.error("Error uploading image to Cloudinary:", err);
            return {
              error: "Failed to upload image",
            };
          }
        })
      );
    }

    // Check if any image upload failed
    const failedUploads = uploadedImages.filter((img) => img.error);
    if (failedUploads.length > 0) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to upload some images" });
    }

    // Create a new property
    const newproperty = new Property({
      title,
      price,
      description,
      tag,
      location,
      bedroom,
      bathroom,
      images: uploadedImages,
    });

    // Save the property to the database
    await newproperty.save();

    // Respond with success message
    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property: newproperty,
    });
  } catch (err) {
    console.error("Error creating property:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to create property",
      error: err.message,
    });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    // const { title, description, price } = req.body;
    const { title, description, price, location, bedroom, bathroom, tag} = req.body;

    const imageFiles = req.files;

    // Find the property by ID
    const property = await Property.findById({_id: propertyId} );
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    // Update property fields if provided
    if (title) {
      property.title = title;
      property.slug = slugify(title);
    }
    if (description) {
      property.description = description;
    }
    if (price) {
      property.price = price;
    }
    if (location) {
      property.location = location;
    }
    if (bedroom) {
      property.bedroom = bedroom;
    }
    if (bathroom) {
      property.bathroom = bathroom;
    }
    if (tag) {
      property.tag = tag;
    }
    

    // Upload new images to Cloudinary if provided
    let uploadedImages = [];
    if (imageFiles && imageFiles.length > 0) {
      uploadedImages = await Promise.all(
        imageFiles.map(async (file) => {
          try {
            const imageResult = await cloudinary.uploader.upload(file.path);
            return {
              url: imageResult.secure_url,
              imagePublicId: imageResult.public_id,
            };
          } catch (err) {
            console.error("Error uploading image to Cloudinary:", err);
            return {
              error: "Failed to upload image",
            };
          }
        })
      );

      // Check if any image upload failed
      const failedUploads = uploadedImages.filter((img) => img.error);
      if (failedUploads.length > 0) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to upload some images" });
      }

      // Update property images if new ones are uploaded
      property.images = uploadedImages;
    }

    // Save the updated property to the database
    await property.save();

    // Respond with success message
    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property,
    });
  } catch (err) {
    console.error("Error updating property:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to update property",
      error: err.message,
    });
  }
};

export const getAllProperties = async (req, res) => {
    try {
      const properties = await Property.find();
      const totalproperties = await Property.countDocuments();

      res.status(200).json({
        success: true,
        message: "properties retrieved successfully",
        totalproperties,
        properties,
      });
    } catch (err) {
      console.error("Error retrieving properties:", err.message);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve properties",
        error: err.message,
      });
    }
  };


export const getPropertyById = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const property = await Property.findById({_id: propertyId});
  
      if (!property) {
        return res.status(404).json({
          success: false,
          message: "property not found",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "property retrieved successfully",
        property,
      });
    } catch (err) {
      console.error("Error retrieving property:", err.message);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve property",
        error: err.message,
      });
    }
  };
  
  
export const deleteProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;  
      // Find the property by ID
      const property = await Property.findByIdAndDelete({_id: propertyId});
      if (!property) {
        return res
          .status(404)
          .json({ success: false, message: "property not found" });
      }
  
      // Delete images from Cloudinary
      if (property.images && property.images.length > 0) {
        await Promise.all(
          property.images.map(async (image) => {
            try {
              await cloudinary.uploader.destroy(image.imagePublicId);
            } catch (err) {
              console.error("Error deleting image from Cloudinary:", err);
            }
          })
        );
      }
  
      // Respond with success message
      res.status(200).json({
        success: true,
        message: "property deleted successfully",
      });
  
    } catch (err) {
      console.error("Error deleting property:", err.message);
      res.status(500).json({
        success: false,
        message: "Failed to delete property",
        error: err.message,
      });
    }
  };