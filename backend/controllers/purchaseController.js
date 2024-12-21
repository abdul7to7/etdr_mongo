const razorPay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order"); // Assuming Order model is now Mongoose-based
const User = require("../models/User"); // Assuming User model is now Mongoose-based
const generateToken = require("../middleware/authGenerate");

exports.buyMemberShip = (req, res, next) => {
  try {
    let rzp = new razorPay({
      key_id: process.env.RZP_KEY_ID,
      key_secret: process.env.RZP_KEY_SECRET,
    });

    const amount = 2500; // Amount in paise (i.e., 2500 paise = ₹25)

    rzp.orders.create({ amount, currency: "INR" }, async (err, rzpOrder) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: `Something went wrong ${err}`,
        });
      }

      try {
        const order = new Order({
          userId: req.user.id,
          rzpOrderId: rzpOrder.id,
          status: "PENDING",
        });

        await order.save();
        return res.status(201).json({
          orderId: order.id,
          rzpOrder,
          key_id: rzp.key_id,
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: `Error creating order: ${err.message}`,
        });
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error: ${err.message}`,
    });
  }
};

exports.verifyPurchase = async (req, res, next) => {
  const { orderId, rzpOrderId, payment_id, signature } = req.body;

  const hmac = crypto.createHmac("sha256", process.env.RZP_KEY_SECRET);
  hmac.update(rzpOrderId + "|" + payment_id);
  const generatedSignature = hmac.digest("hex");

  const status = generatedSignature === signature ? "SUCCESS" : "FAILED";
  const userStatus = generatedSignature === signature;
  const userIsPremium = userStatus;

  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      { status: status, paymentId: payment_id },
      { new: true }
    );

    const user = await User.findOneAndUpdate(
      { _id: req.user.id },
      { isPremium: userStatus },
      { new: true }
    );

    if (generatedSignature === signature) {
      const token = generateToken({
        id: req.user.id,
        username: req.user.username,
        isPremium: userIsPremium,
      });

      return res.json({
        status: "success",
        message: "Payment verified successfully",
        token: token,
        user: {
          username: req.user.username,
          isPremium: userIsPremium,
        },
      });
    } else {
      throw new Error("Payment verification failed");
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error: ${err.message}`,
    });
  }
};
