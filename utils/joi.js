const Joi = require('joi')

const userSchema = Joi.object({
    username: Joi.string().trim().required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(5).required(),
    roles: Joi.array().items(Joi.string().valid('user', 'admin')).min(1).required()
})

const updateUserSchema = Joi.object({
    username: Joi.string().trim(),
    email: Joi.string().trim().email(),
    newPassword: Joi.string().min(5),
    roles: Joi.array().items(Joi.string().valid('user', 'admin')).min(1)
})


const joi = {
    userSchema,
    updateUserSchema
}

module.exports = joi