'use strict'
const { Schema, model } = require('mongoose')
const ModelNames = require('./ModelNames.json')
const ModelActions = require('./ModelActions.json')
const UserAccess = require('./UserAccess')

/**
 * User model
 *
 * */
const schema = new Schema({
    /** User name **/
    name: String,
    /** User middlename **/
    middleName: String,
    /** User lastname **/
    lastName: String,
    /** User phone number **/
    phoneNumber: String,
    /** User email **/
    email: { type: String, unique: true},
    /** User hashed password **/
    password: { type: String, required: true },
    /** User login **/
    login: { type: String, unique: true, required: true }
})

/** Returns the user access
 *
 * @property self._acceess is a cached access
 * */
schema.methods.getAccess = async function() {
    const self = this
    if (!self._access)
        self._access = await UserAccess.findOne({ user: self._id })
    return self._access
}

/** Creates user access after user has been created **/
schema.post(ModelActions.save, async function() {
    const user = this
    /** if user has been created before or already have custom created UserAccess **/
    if (await user.getAccess())
        return

    /** create UserAccess after user has been saved **/
    const access = new UserAccess()
    if (user.adminAccess)
        access.adminAccess = user.adminAccess
    if (user.loginAccess)
        access.loginAccess = user.loginAccess
    if (user.testAccess)
        access.testAccess = user.testAccess
    if (user.analyticAccess)
        access.analyticAccess = user.analyticAccess
    if (user.resultAccess)
        access.resultAccess = user.resultAccess
    access.user = user
    access.save()
})

/** Removes user access after user has been removed **/
schema.post(ModelActions.remove, async function() {
    const user = this
    const access = await user.getAccess()
    if (!access)
        return

    /** remove UserAccess after user has been removed **/
    await access.remove()
})

module.exports = model(ModelNames.User, schema)