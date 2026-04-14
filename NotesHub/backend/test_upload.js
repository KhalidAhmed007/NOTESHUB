const { cloudinary } = require('./config/cloudinary'); cloudinary.uploader.upload('package.json', {resource_type: 'image', format: 'pdf'}).then(console.log).catch(console.error);
