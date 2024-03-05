const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Payment = require('../models/Payments');
const Cart = require('../models/Carts');
const ObjectId = require('mongoose').Types.ObjectId; // Import ObjectId correctly
const verifyToken = require('../middleware/verifyToken');



//post payment inform to db
router.post('/', verifyToken, async (req, res) => {
  const payment = req.body;
  try {
    const paymentRequest = await Payment.create(payment);

    //delte cart after payments
   const cartIds = payment.cartItems.map(id => new ObjectId(id));
   const deleteCartRequest = await Cart.deleteMany({_id: {$in: cartIds}});
    res.status(200).json({paymentRequest, deleteCartRequest});
  } catch (error) {
    res.status(404).json({message: error.message});
  }
})

router.get('/', verifyToken, async(req, res)=>{
  const email = req.query.email;
  const query = {email: email}
  try {
    const decodedEmail = req.decoded.email;
    if(email !== decodedEmail){
      res.status(403).json({message: "Forbiden Access"})
    }
    const result = await Payment.find(query).sort({createdAt: -1}).exec();
    res.status(200).json(result)
  } catch (error) {
    res.status(404).json({message: error.message});
  }
});

//get all payments by users
router.get('/all', async(req, res)=> {
  try {
    const payments = await Payment.find({}).sort({createdAt: -1}).exec();
    res.status(200).json(payments);

  } catch (error) {
    res.status(404).json({message: error.message});
  }
})


//confirm payments status 

router.patch('/:id', async (req, res) => {
  const payId = req.params.id;
  const  {status} = req.body;
  try {
    const updatedStatus = await Payment.findByIdAndUpdate(
      payId,
      { status: "confirmed" },
      { new: true, runValidators: true }
    );

    if (!updatedStatus){
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json(updatedStatus); 
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;