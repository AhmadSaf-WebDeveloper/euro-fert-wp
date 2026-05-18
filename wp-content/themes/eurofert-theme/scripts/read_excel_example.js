const xlsx = require("xlsx");
const path = require("path");

// Resolve the path to your Excel file dynamically
const excelPath = path.join(__dirname, "products.xlsx");

try {
  // Read the workbook
  const workbook = xlsx.readFile(excelPath);
  
  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Convert sheet to JSON array
  const data = xlsx.utils.sheet_to_json(sheet);
  console.log(`Successfully read ${data.length} rows from Excel.`);

  // Example: Find a specific product by slug
  const ktcProduct = data.find(p => p.slug === "colfert-essential-ktc");
  
  if (ktcProduct) {
    console.log("Found product:");
    console.log(JSON.stringify(ktcProduct, null, 2));
  } else {
    console.log("Product not found.");
  }
} catch (error) {
  console.error("Error reading the Excel file:", error.message);
}
