'use strict'
const { Schema, model } = require('mongoose')
const ModelNames = require('./ModelNames.json')

/**
 * User Access model
 *
 * */

const schema = new Schema({
    adminAccess: { type: Boolean, default: false, required: true },
    testAccess: { type: Boolean, default: false, required: true },
    analyticAccess: { type: Boolean, default: false, required: true },
    resultAccess: { type: Boolean, default: false, required: true },
    loginAccess: { type: Boolean, default: false, required: true },
    user: { type: Schema.Types.ObjectId, ref: ModelNames.User, required: true, unique: true }
})

module.exports = model(ModelNames.UserAccess, schema)