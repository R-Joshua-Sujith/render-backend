
const ProductModel = require("../models/Product.js")
const OrderModel = require("../models/Order.js")
const router = require("express").Router();

router.get('/', async (req, res) => {
    try {
        const products = await ProductModel.find();
        res.status(200).json(products)
    } catch (err) {
        res.status(500).json(err);
    }
})
router.post('/addProduct', async (req, res) => {
    const newProduct = new ProductModel({
        "name": req.body.name,
        "price": req.body.price,
        "category": req.body.category,
        "image": req.body.image
    })
    try {
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
})

router.get("/product/:id", async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id);
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json(err);
    }
})

router.post('/addOrder', async (req, res) => {
    const newOrder = new OrderModel({
        "product_Name": req.body.product_Name,
        "quantity": req.body.quantity,
        "price": req.body.price,
        "image": req.body.image,
        "payment_id": req.body.payment_id
    })
    try {
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(500).json(err);
    }
})

router.get('/orders', async (req, res) => {
    try {
        const orders = await OrderModel.find();
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
})

module.exports = router;