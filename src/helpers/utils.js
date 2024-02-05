const SnowflakeId = require('snowflake-id').default;
const config = require('../configs')

function convertToBase62(number) {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const base = characters.length;
  
    if (number === 0) {
      return '0';
    }
    let result = '';
    while (number > 0) {
      const remainder = number % base;
      result = characters[remainder] + result;
      number = Math.floor(number / base);
    }
    return result;
  }
  
  const generateSnowFlakeUniqueId = () => {
    
    const snowFlakeId = new SnowflakeId({
        mid: config.MACHINE_ID,
        offset: (2023 - 1970) * 31536000 * 1000,
    })
    console.log(snowFlakeId.generate())
    return snowFlakeId.generate() //  generate a string  and if u parse this to int u will loose precision (value)
        // so parse it to bigint if u need to perform any operation
}


  module.exports = {
    convertToBase62,
    generateSnowFlakeUniqueId
  }