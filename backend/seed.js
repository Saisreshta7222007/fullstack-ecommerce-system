import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productModel from './models/productModel.js';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

async function run() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected.");

    const rawData = fs.readFileSync('parsed_products.json', 'utf8');
    const products = JSON.parse(rawData);

    console.log(`Starting upload for ${products.length} products...`);

    for (let i = 0; i < products.length; i++) {
        const item = products[i];
        console.log(`Processing product ${i + 1}/${products.length}: ${item.name}`);

        try {
            // Upload images to Cloudinary
            const imagesUrl = [];
            for (const imgPath of item.image) {
                if (fs.existsSync(imgPath)) {
                    const result = await cloudinary.uploader.upload(imgPath, { resource_type: 'image' });
                    imagesUrl.push(result.secure_url);
                } else {
                    console.log(`Warning: Image not found locally - ${imgPath}`);
                }
            }

            // Create product data formatting similar to Add.jsx
            const productData = {
                name: item.name,
                description: item.description,
                category: item.category,
                price: Number(item.price),
                subCategory: item.subCategory,
                bestseller: typeof item.bestseller === "boolean" ? item.bestseller : item.bestseller === "true",
                sizes: item.sizes,
                image: imagesUrl,
                date: item.date || Date.now()
            };

            const product = new productModel(productData);
            await product.save();
            console.log(`Saved ${item.name} successfully.`);
        } catch (error) {
            console.error(`Failed to process ${item.name}: ${error.message}`);
        }
        
    }

    console.log("Seeding complete!");
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
