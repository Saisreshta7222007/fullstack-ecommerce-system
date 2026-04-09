import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import crypto from 'crypto';
import Razorpay from 'razorpay';

//Placing orders using COD Method
const placeOrder = async (req, res) => {
 try{

    const {userId, items, amount, address} = req.body;

    const orderData={
        userId,
        items,
        address,
        amount,
        paymentMethod:"COD",
        payment:false,
        date: Date.now()
    }
 const newOrder = new orderModel(orderData);
 await newOrder.save();

 await userModel.findByIdAndUpdate(userId,{cartData:{}}) 

 res.json({success:true, message:"Order Placed"}); 

 } catch (error){
    console.log(error);
    res.json({success:false, message:error.message});
 }
}

//Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {

}

//Placing orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
  try {
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID?.trim()
    const razorpaySecretKey = process.env.RAZORPAY_SECRET_KEY?.trim()

    if (!razorpayKeyId || !razorpaySecretKey) {
      return res.json({
        success: false,
        message: 'Razorpay credentials are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_SECRET_KEY in backend/.env.'
      })
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpaySecretKey
    })

    const { userId, items, amount, address } = req.body

    const options = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency: 'INR',
      receipt: `order_rcptid_${Date.now()}`,
      payment_capture: 1
    }

    const order = await razorpay.orders.create(options)

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    })
  } catch (error) {
    console.log('Razorpay order creation error:', error)
    res.json({
      success: false,
      message: error.message || 'Failed to create Razorpay order'
    })
  }
}

//Verify Razorpay Payment
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, address, items, amount } = req.body
    const userId = req.body.userId

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.json({
        success: false,
        message: 'Missing payment verification data'
      })
    }

    // Verify signature using Razorpay Order ID and Payment ID
    const body = razorpayOrderId + "|" + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(body.toString())
      .digest("hex")

    const isAuthentic = expectedSignature === razorpaySignature

    if (isAuthentic) {
      // Create order in database
      const orderData = {
        userId,
        items,
        address,
        amount,
        paymentMethod: "Razorpay",
        payment: true,
        date: Date.now(),
        razorpayOrderId,
        razorpayPaymentId
      }

      const newOrder = new orderModel(orderData)
      await newOrder.save()

      // Clear user's cart
      await userModel.findByIdAndUpdate(userId, { cartData: {} })

      res.json({
        success: true,
        message: "Payment verified and order placed successfully"
      })
    } else {
      res.json({
        success: false,
        message: "Payment verification failed - invalid signature"
      })
    }
  } catch (error) {
    console.log('Razorpay verification error:', error)
    res.json({
      success: false,
      message: error.message || 'Payment verification failed'
    })
  }
}

//All Orders data for Admin Panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({success:true, orders});
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message});
    }
}

//User Order Data for Frontend
const userOrders = async (req, res) => {
  try{

    const {userId} = req.body;

    const orders = await orderModel.find({userId});
    res.json({success:true, orders});
  } catch (error){
    console.log(error);
    res.json({success:false, message:error.message});

  }
}

//update order status from Admin Panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({success:true, message:'Status Updated'});
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message});
    }
}

export {placeOrder, placeOrderStripe, placeOrderRazorpay, verifyRazorpay, allOrders, userOrders, updateStatus};