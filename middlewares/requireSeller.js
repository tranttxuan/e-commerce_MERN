module.exports = function requiteSeller(req, res, next) {
     if (req.session.currentUser && req.session.currentUser_isSeller) {
          next();
     } else {
          res.status(401).json({ message: "invalid Seller" });
     }
};