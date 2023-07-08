const express = require('express')
const { createCategory, getCategories, deleteCategory, updateCategory } = require('../../controllers/categories/category');
const isLoggin = require('../../middlewares/isLoggin');

const categoryRouter = express.Router();

//create category
categoryRouter.post("/", isLoggin, createCategory)

//? get all Categories
categoryRouter.get("/", getCategories)


//! delete 
categoryRouter.delete("/:id",isLoggin, deleteCategory)


//* update
categoryRouter.put('/:id', isLoggin, updateCategory)




module.exports = categoryRouter;