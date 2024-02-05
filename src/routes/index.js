const express = require('express')
const router = express.Router()
const urlController = require('../controllers/url.controller.js')

router.post('/api/v1/shorten-url',urlController.shortenUrl)
router.get('/api/v1/long-url/:short_url',urlController.longUrl)
router.get('/api/v1/url-analytics/:limit/:offset',urlController.urlAnalytics)


module.exports = router