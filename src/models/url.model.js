const utils = require('../helpers/utils')
const mysql = require('../helpers/mysql')
const config = require('../configs')
const crypto = require('crypto')

module.exports.genrateShorturl = async({ long_url,ip, BASE_URL })=>{
    try{
        let shortUrl = ''

        const longUrlHash  = crypto.createHash('sha256').update(long_url).digest('hex');
        
        const searchQuery = ` select * from ${config.SHORT_URL} where long_url_hash = ? and is_expired = ? and 
        date_created >= NOW() - INTERVAL 24 HOUR;`
        if(ip == '::1' ){
            ip = '127.0.0.1'
        }
        const insertClickCountQuery = `insert into ${config.ANALYTICS} (ip,date_created) values (?,now())`

        const searchPromise = mysql.execquery(searchQuery,[longUrlHash,0]);
        const insertClickCountQueryPromise = mysql.execquery(insertClickCountQuery,[ip])
        const promsieArrResult = await Promise.allSettled([searchPromise,insertClickCountQueryPromise])
        const searchResult = promsieArrResult[0]['value']

        
        if(!searchResult || !searchResult.success){
            throw "search query failed!"
        }
        
        if(searchResult.data.length){
            shortUrl  = searchResult.data[0]['short_url']
        } else {
            const UniqueID = utils.generateSnowFlakeUniqueId()

            shortUrl = utils.convertToBase62(UniqueID)
            // check if already exists
            const shortUrlInsertQuery = `insert into ${config.SHORT_URL} (short_url,long_url,long_url_hash,date_created,visit_count , is_expired ) values(?,?,?,now(),?,?)`
            
            const saveResult = await mysql.execquery(shortUrlInsertQuery,[shortUrl,long_url,longUrlHash,0,0]);
            
            
            if(!saveResult || !saveResult.success){
                throw "mysql query failed!!"
            }
        }
        return {
            success:true,
            error:"",
            message:"successful",
            data:[{short_url:BASE_URL+shortUrl}]
        }
    }catch(e){
        console.error("Exception:",e)
        return {
            success:false,
            error:e.toString(),
            message:"failed",
            data:[]
        }
    }
}

module.exports.getLongUrl = async({short_url})=>{
    try {
        const searchQuery = ` select * from ${config.SHORT_URL} where short_url = ?   `

        const searchResult = await mysql.execquery(searchQuery,[short_url]);
        
        
        if(!searchResult || !searchResult.success){
            throw "search query failed!"
        }
        
        if(!searchResult.data.length){
            throw "invalid url!!"
        }
        const urlObject = searchResult.data[0]
        
        const dateCreated = urlObject['date_created']
        
        // Calculate the time difference in milliseconds
        const timeDifferenceInMillis = Math.abs(new Date().getTime() - new Date(dateCreated).getTime());

        // Convert milliseconds to hours
        const hoursDifference = timeDifferenceInMillis / (1000 * 60 * 60);
        
        if(hoursDifference >= 24 ){
            const expiredQuery = `update ${config.SHORT_URL} set is_expired = 1 where short_url = ? `
            const setExpiredStatus = await mysql.execquery(expiredQuery,[short_url])
            console.log(setExpiredStatus)
            throw "short url expired!"
        }
        
        const visitQuery = `update ${config.SHORT_URL} set visit_count = visit_count + 1 where short_url = ? `
        
        const visitQueryResult = await mysql.execquery(visitQuery,[short_url])
        
        
        return {
            success:true,
            error:"",
            message:"successful",
            data:[{long_url:urlObject.long_url}]
        }
    }catch(e){
        console.log(e)
        return {
            success:false,
            error:e.toString(),
            message:"",
            data:[]
        }
    }
}



module.exports.getUrlAnalytics = async({limit,offset,BASE_URL})=>{
    try {
        const dataQuery = `select concat('${BASE_URL}',short_url) as short_url,visit_count,date_created,long_url  from ${config.SHORT_URL} limit ? offset ?`
        const countQuery = `select count(*) as total_clicks from ${config.ANALYTICS} `;
        const dataQueryPromise = mysql.execquery(dataQuery,[parseInt(limit),parseInt(offset)])
        const countQueryPromise = mysql.execquery(countQuery,[])
        const promiseArrResult = await Promise.allSettled([dataQueryPromise,countQueryPromise])
        
        if(!promiseArrResult || !promiseArrResult[0]['value']['success']){
            throw "analytics data query failed!"
        }
        if(!promiseArrResult || !promiseArrResult[1]['value']['success']){
            throw "analytics count data query failed!"
        }
        return {
            success:true,
            error:"",
            message:"",
            data:[{
                total_click_count: promiseArrResult[1]['value']['data'][0]['total_clicks'],
                visit_data:promiseArrResult[0]['value']['data']
            }]
        }
    }catch(e){
        console.log(e)
        return {
            success:false,
            error:e.toString(),
            message:"",
            data:[]
        }
    }
}
