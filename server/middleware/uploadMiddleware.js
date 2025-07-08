const multer = require('multer');

// Set up storage for uploaded files 
const storage = multer.memoryStorage(); 

const csvFilter = (req, file, cb) => {
     console.log('Received file mimetype:', file.mimetype);
    if (file.mimetype.includes("csv")) {
        cb(null, true);
    } else {
        cb("Please upload only csv file.", false);
    }
};

const upload = multer({ storage: storage, fileFilter: csvFilter });

module.exports = upload;