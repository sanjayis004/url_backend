const Joi = require('joi')
const urlModel = require('../models/url.model.js')

module.exports.shortenUrl = async(req, res) => {
    const joiSchema = Joi.object().keys({
        body: {
            long_url: Joi.string().required()
        }
    }
    ).options({ allowUnknown: true })
    let result = joiSchema.validate({ body: req.body })
    
    if (result && result.error) {
        return res.send({
            success: false,
            error: result.error.details[0].message,
            message: "failed",
            data: []
        })
    } else {
        const BASE_URL = req.headers.origin+'/'; 
        const shortUrlResult = await urlModel.genrateShorturl({...req.body,ip:req.ip,BASE_URL})
        return res.send(shortUrlResult)
    }
}


module.exports.longUrl = async(req,res)=>{
    const joiSchema = Joi.object().keys({
        params: {
            short_url: Joi.string().required()
        }
    }
    ).options({ allowUnknown: true })
    let result = joiSchema.validate({ params: req.params })
    if (result && result.error) {
        return res.send({
            success: false,
            error: result.error.details[0].message,
            message: "failed",
            data: []
        })
    } else {
        const shortUrlResult = await urlModel.getLongUrl({...req.params})
        return res.send(shortUrlResult)
    }
}
module.exports.urlAnalytics = async(req,res)=>{
    try {
        const joiSchema = Joi.object().keys({
            params: {
                limit: Joi.number().optional(),
                offset: Joi.number().optional()
            }
        }
        ).options({ allowUnknown: true })
        let result = joiSchema.validate({ params: req.params })
        if (result && result.error) {
            return res.send({
                success: false,
                error: result.error.details[0].message,
                message: "failed",
                data: []
            })
        }else {
            const BASE_URL = req.headers.origin+'/'; 
            const analyticsResult = await urlModel.getUrlAnalytics({...req.params,BASE_URL})  
            return res.send(analyticsResult)

        }
    }catch(e){
        return res.send({
            success:false,
            error:e.toString(),
            message:"",
            data:[]
        })  
    }
          
}