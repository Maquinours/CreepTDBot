module.exports = (message) => {
    if(!(typeof(message) == 'string')) throw new Error('Variable type error');

    let data = '[' + new Date().toLocaleString() + ']';
    data += message;
    console.log(data);
}