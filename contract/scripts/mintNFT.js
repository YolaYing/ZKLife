const inputInfo = require('../assets/inputInfo.json');
var axios = require('axios');

async function uploadDigitalFileToIPFS() {
    var FormData = require('form-data');
    var fs = require('fs');
    var data = new FormData();
    data.append('file', fs.createReadStream('/Users/Desktop/images/cat.JPG'));
    data.append('pinataOptions', '{"cidVersion": 1}');
    data.append('pinataMetadata', '{"name": "MyFile", "keyvalues": {"company": "Pinata"}}');

    var config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
    headers: { 
        'Authorization': 'Bearer PINATA JWT', 
        ...data.getHeaders()
    },
    data : data
    };

    const res = await axios(config);

    console.log(res.data);
}

async function main() {
    console.log(inputInfo);
}

main()