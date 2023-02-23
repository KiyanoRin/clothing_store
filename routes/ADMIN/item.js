require("dotenv").config();
const map_cat_id = require("../../constant/catagory");
const express = require("express");
const router = express.Router();
const { Item, VariantItem, sequelize } = require("../../models/db");
const upload = require("../../middleware/uploadImage");

const limit = parseInt(process.env.LIMIT_PAGE); // Number of items to display per page

//GET by category
router.get("/category/:category", (req, res) => {
  const page = req.query.page || 1;
  const limit = parseInt(process.env.LIMIT_PAGE); // Number of items to display per page
  const offset = (page - 1) * limit;
  const cat_id = req.params.category;
  Item.findAndCountAll({
    where: { category: map_cat_id[cat_id] },
    offset,
    limit,
  })
    .then((result) => {
      const items = result.rows;
      const totalItems = result.count;
      const totalPages = Math.ceil(totalItems / limit);

      res.status(200).json({
        items,
        currentPage: page,
        totalPages,
        totalItems,
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
});

// GET one item
router.get("/:itemId", (req, res) => {
  Item.findByPk(req.params.itemId)
    .then((item) => {
      res.status(200).json({
        item,
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
});

// POST a new item
router.post("/", upload.single("image"), async (req, res) => {
  const { name, description, price, category, variantitems } = req.body;
  const image = req.file || { path: "asdasdsaaedrwg" };
  console.log(name, description, price, category, variantitems);
  try {
    const item = await Item.create(
      {
        name: name,
        description: description,
        price: price,
        image: image.path,
        category: map_cat_id[parseInt(category)],
        VariantItems: variantitems,
      },
      {
        include: [{ model: VariantItem }],
      }
    );
    res.json(item);
  } catch (error) {
    res.json(error);
  }
});

// PUT (update) an existing account
router.put("/", (req, res) => {
  Item.findByPk(req.query.itemId)
    .then((item) => {
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      return item.update(req.body).then(() => {
        res.status(200).json({ message: "Item updated successfully" });
      });
    })
    .catch((error) => {
      res.status(400).json({ error: error.message });
    });
});

// DELETE a specific account
router.delete("/", (req, res) => {
  Item.destroy({ where: { accountId: req.query.itemId } })
    .then(() => {
      res.status(200).json({
        message: `Successfully deleted account with ID ${req.query.itemId}`,
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
});

// GET all items
router.get("/", (req, res) => {
  const page = req.query.page || 0; // Default to first page if no page number is specified
  const offset = page * limit;

  Item.findAndCountAll({
    offset,
    limit,
    attributes: ["itemId", "name", "price", "image"],
  })
    .then((result) => {
      const items = result.rows;
      const totalItems = result.count;
      const totalPages = Math.ceil(totalItems / limit);

      res.status(200).json({
        items,
        currentPage: page,
        totalPages,
        totalItems,
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
});

module.exports = router;
