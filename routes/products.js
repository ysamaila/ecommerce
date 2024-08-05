const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Create product
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, price, imageURL } = req.body;
        const product = new Product({ name, description, price, imageURL, createdBy: req.user.id });
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('createdBy', 'username');
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update product
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, imageURL } = req.body;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'User not authorized' });

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.imageURL = imageURL || product.imageURL;

        await product.save();
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'User not authorized' });

        await product.remove();
        res.json({ message: 'Product removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
