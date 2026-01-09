const fs = require('fs'); // fs (file system) is global pkg

const handleRequest = (req, res) => {
    const url = req.url;
    const method = req.method;

    res.setHeader('Content-Type', 'text/html');

    if (url === '/') {
        res.write('<html>');
        res.write('<head>');
        res.write('<body><h1>Greeting</h1><form action="/create-user" method="POST"><input type="text" name="username" /><button type="submit">Submit</button></from></body>');
        res.write('</head>');
        res.write('<html>');
        res.statusCode = 200;
        return res.end();
    }

    if (url === '/users') {
        res.write('<html>');
        res.write('<head>');
        res.write('<body><ul><li>User1</li></ul></body>');
        res.write('</head>');
        res.write('<html>');
        res.statusCode = 200;
        return res.end();
    }

    if (url === '/create-user' && method === "POST") {
        const body = [];
        req.on('data', (chunks) => {
            console.log(chunks);
            body.push(chunks);
        })

        return req.on('end', () => {
            const bodyParse = Buffer.concat(body).toString();
            console.log(bodyParse.split('=')[1]);
            fs.writeFile('demo.txt', bodyParse.split('=')[1], err => {
                res.statusCode = 302;
                res.write('<html>');
                res.write('<head>');
                res.write('<body><h1>Welcome to users</h1></body>');
                res.write('</head>');
                res.write('<html>');
                // res.setHeader('Location', '/');
                return res.end();
            });
        });
    }
    // res.setHeader('Content-Type', 'text/html');
}

module.exports = handleRequest;