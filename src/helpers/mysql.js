const mysql = require('mysql')
const config = require('../configs')
const con = mysql.createPool(config.mysql)
    
module.exports.connection = async() => {
    return new Promise(async(resolve, reject) => {
        con.getConnection(function(err, connection) {
            if (err) {
                return reject(err)
            } else {
                return resolve(connection)
            }
        })
    })
}

module.exports.execquery = async(query, params) => {
    return new Promise(async(resolve, reject) => {
        let con = await this.connection()
            //console.log(con)

        con.query(query, params, function(err, result) {
            con.release();
            //console.log(err,result)
            if (err) {
                console.log("mysql error:", err)

                return resolve({
                    success: false,
                    error: "query failed",
                    data: []
                })
            } else {
                
                return resolve({
                    success: true,
                    error: "",
                    data: result
                })
            }

        })
    })
}


module.exports.transactionStart = () => {
    return new Promise(async(resolve, reject) => {
        let con = await this.connection()
        con.beginTransaction((err) => {
            if (err) {
              console.log(err)
                con.release();
                return reject(err);
            } else {
                return resolve(con)
            }
        })

    })


}

module.exports.transactionQuery = (connection,query,param) => {
  return new Promise((resolve,reject)=>{
    connection.query(query,param,function(error,result){
      if(error){
        console.log(error)
        return reject({success:false})
      }else{
        return resolve({success:true})
      }
    })

  })

}


module.exports.transactionCommit = (connection) => {
  return new Promise((resolve,reject)=>{
    connection.commit(async function(error,result){
      if(error){
        console.log(error)
        await this.transactionRollback(connection)
        return reject(error)
      }else{
        await connection.release()
        return resolve(result)
      }
    })

  })

}

module.exports.transactionRollback = (connection) => {
  return new Promise((resolve,reject)=>{
    connection.rollback(async function(error,result){
      if(error){
        console.log(error)
        await connection.release()
        return reject(error)
      }else{
        await connection.release()
        return resolve(result)
      }
    })
  })
}
