const request = require("request");

module.exports = async (url) => {
    if(!(typeof(url) == 'string')) throw new Error('Variable type error');
    
    let result = await new Promise((resolve, reject) => request(url, { json: true }, (err, res, json) => {
        if (err)
            reject(err);
        else {
            if (json.error)
                reject(new Error(json.error));
            else
                resolve(json);
        }
    }));
    return result;
}