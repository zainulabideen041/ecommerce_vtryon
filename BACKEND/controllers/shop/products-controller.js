const Product = require("../../models/Product");

// Utility function to ensure HTTPS for Cloudinary URLs
const ensureHttps = (url) => {
  if (!url) return url;
  // Convert HTTP Cloudinary URLs to HTTPS to prevent mixed content errors
  if (url.startsWith("http://res.cloudinary.com")) {
    return url.replace("http://", "https://");
  }
  return url;
};

const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

const getFilteredProducts = async (req, res) => {
  try {
    const { category = [], brand = [], sortBy = "price-lowtohigh" } = req.query;

    // Create a unique cache key based on query parameters
    const cacheKey = `products_${JSON.stringify(req.query)}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
      });
    }

    let filters = {};

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }

    let sort = {};

    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.price = 1;
        break;
    }

    // Use Aggregation Pipeline for efficient data retrieval
    // Match -> Sort -> Project
    const pipeline = [
      { $match: filters },
      { $sort: sort },
      {
        $project: {
          image: 1,
          title: 1,
          description: 1,
          category: 1,
          brand: 1,
          price: 1,
          salePrice: 1,
          totalStock: 1,
          averageReview: 1,
        },
      },
    ];

    const products = await Product.aggregate(pipeline).exec();

    // Ensure all image URLs use HTTPS
    const productsWithHttps = products.map((product) => ({
      ...product,
      image: ensureHttps(product.image),
    }));

    // Cache the result
    cache.set(cacheKey, productsWithHttps);

    res.status(200).json({
      success: true,
      data: productsWithHttps,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `product_details_${id}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
      });
    }

    const product = await Product.findById(id).lean().exec();

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    // Ensure image URL uses HTTPS
    const productWithHttps = {
      ...product,
      image: ensureHttps(product.image),
    };

    cache.set(cacheKey, productWithHttps);

    res.status(200).json({
      success: true,
      data: productWithHttps,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails };
