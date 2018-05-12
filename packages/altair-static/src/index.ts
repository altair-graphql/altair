const fs = require('fs');
const path = require('path');

export const renderAltair = (opts) => {
    const altairHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');
    console.log(altairHtml);
};
