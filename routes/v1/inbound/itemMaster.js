const express= require('express');
const router = express.Router();
const itemMaster = require('../../../controller/itemMaster');
//routes the incoming request to controller
router.get('/get',itemMaster.get);

module.exports = router;
