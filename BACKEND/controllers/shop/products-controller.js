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

const getFilteredProducts = async (req, res) => {
  try {
    const { category = [], brand = [], sortBy = "price-lowtohigh" } = req.query;

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

    // Optimized: use lean() for faster queries and select only needed fields
    const products = await Product.find(filters)
      .select(
        "image title description category brand price salePrice totalStock averageReview",
      )
      .sort(sort)
      .lean()
      .exec();

    // Ensure all image URLs use HTTPS
    const productsWithHttps = products.map((product) => ({
      ...product,
      image: ensureHttps(product.image),
    }));

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
