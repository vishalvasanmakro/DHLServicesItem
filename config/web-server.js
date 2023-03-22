const port = process.argv[2];
console.log('Args from commandline:',port);

module.exports = {
    port: process.env.HTTP_PORT || port
    };