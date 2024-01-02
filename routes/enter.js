const router = require("express").Router()


router.post('/', enterHandler)


function enterHandler(req, res, next) {
  console.log("req.body:", req.body);  
  res.send(`${req.body.user} entered`)
}


module.exports = router