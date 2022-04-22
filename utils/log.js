module.exports = (message) => {
    let data = '[' + new Date().toLocaleString() + ']';
    data += message;
    console.log(data);
}