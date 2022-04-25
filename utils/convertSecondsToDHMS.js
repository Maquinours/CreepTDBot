function formatDigits(number, digits) {
    if (!(typeof (number) == 'number' && typeof (digits) == 'number')) throw new Error('Variable type error');

    const numberDigits = `${number}`.length;
    let result = "";
    for (i = digits - numberDigits; i > 0; i--)
        result += "0";
    result += number;
    return result;
}

module.exports = (seconds) => {
    if (!(typeof (seconds) == 'number')) throw new Error('Variable type error');
    let days = Math.floor(seconds / 86400);
    seconds %= 86400;
    let hours = formatDigits(Math.floor(seconds / 3600), 2);
    seconds %= 3600;
    let minutes = formatDigits(Math.floor(seconds / 60), 2);
    seconds %= 60;
    seconds = formatDigits(seconds, 2);
    result = `${days}:${hours}:${minutes}:${seconds}`;
    return result;
}