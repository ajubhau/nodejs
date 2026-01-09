const User = require('../models/user');
const bcrypt = require('bcryptjs');

module.exports = {
    signup: async function({userInput}, req) {
        const extUser = await User.findOne({ email: userInput.email});
        if (extUser) {
            const error = new Error('User exists already');
            throw error;
        }
        const psdHash = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            email: userInput.email,
            password: psdHash,
            name: userInput.name
        });
        const createdUser = await user.save();
        return { ...createdUser._doc, _id: createdUser._id.toString()}
    }   
}
