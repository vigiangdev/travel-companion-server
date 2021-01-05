const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

const UserSchema = new Schema ({
    name: {
        type: String,
        required: true,
    },
    birthday: {
        type: Date,
        required: true,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: (email) => validator.isEmail(email),
            message: "Email is not valid."
        },
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minLength: [8, "Password must contain at least 8 characters."],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: true,
        validate: {
            validator: function(pw) {
                return pw === this.password
            },
            message: "Passwords do not match."
        },
    }
})

// password authentication with mongoose
// https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1

UserSchema.pre('save', function(next) {
    const user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    const SALT_WORK_FACTOR = 10;

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            user.passwordConfirm = undefined;
            next();
        });
    });
});
     
UserSchema.methods.comparePassword = async (candidatePassword, hashedPassword) => {
    const result = await bcrypt.compare(candidatePassword, hashedPassword);
    return result;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;