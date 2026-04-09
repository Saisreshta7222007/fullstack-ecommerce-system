import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsPath = path.resolve(__dirname, '../frontend/src/assets/assets.js');
let raw = fs.readFileSync(assetsPath, 'utf8');

// extract the products array string
const match = raw.match(/export const products = (\[[\s\S]*\])/);
if (!match) {
    console.log("Could not find products array.");
    process.exit(1);
}

let productsStr = match[1];

// This transforms things like:
// image: [p_img2_1,p_img2_2,p_img2_3,p_img2_4]
// into stringified arrays of paths
productsStr = productsStr.replace(/image:\s*\[([^\]]+)\]/g, (fullMatch, vars) => {
    const list = vars.split(',').map(v => v.trim()).filter(Boolean);
    const paths = list.map(v => `"${path.resolve(__dirname, '../frontend/src/assets').replace(/\\/g, '/')}/${v}.png"`);
    return `image: [${paths.join(',')}]`;
});

// Since the JSON format in JS allows unquoted keys and trailing commas, I can't just JSON.parse it directly.
// But I can evaluate it in a context since it has no remaining variables except maybe true/false matching.
let parsedProducts = [];
try {
    parsedProducts = eval(`(${productsStr})`);
} catch(e) {
    console.error("Eval failed:", e);
}

// Remove the `_id` field so Mongo assigns natural ones
parsedProducts = parsedProducts.map((p) => {
    delete p._id;
    return p;
});

fs.writeFileSync('parsed_products.json', JSON.stringify(parsedProducts, null, 2), 'utf8');
console.log("Successfully extracted", parsedProducts.length, "products. Saved to parsed_products.json");
