'use strict'
const { Router } = require('express')
const { check, validationResult} = require('express-validator')
const bcrypt = require('bcrypt')
const router = Router()
const User = require('../models/User')

/**
 * Admin routs
 *
 * */

/** Register new user **/
router.post(
    '/register',
    [
        /** login validator **/
        check('login', 'incorrect login')
            .isLength({ min: 6 }),
        /** password validator **/
        check('password', 'incorrect password')
            .isLength({ min: 6 }),
        //TODO add frontend form validation
    ],
    async (req, res) => {
        try {
            /** validate results **/
            const errors = validationResult(req)

            /** if it is empty continue registration **/
            if (!errors.isEmpty()) {
                return res.status(400).json( {
                    errors: errors.array(),
                    message: 'incorrect register data'
                } )
            }

            /** parse body **/
            const { name,
                middleName,
                lastName,
                login,
                password,
                loginAccess,
                adminAccess,
                email,
                analyticAccess,
                testAccess,
                resultAccess,
                phoneNumber } = req.body

            /** create and save new User to db **/
            const hashedPassword = await bcrypt.hash(password, 12)
            const newUser = new User({
                name,
                middleName,
                lastName,
                login,
                email,
                phoneNumber,
                password: hashedPassword
            })

            /** UserAccess will be created in User.post('save') **/
            newUser.adminAccess = adminAccess || false
            newUser.loginAccess = loginAccess || false
            newUser.testAccess = testAccess || false
            newUser.analyticAccess = analyticAccess || false
            newUser.resultAccess = resultAccess || false
            await newUser.save()

            await res.json({ message: 'User has been successfully created' })
        }
        catch (e) {
            /** write server error to server-err.log **/
            console.error(e)
            /** send error code **/
            res.status(500).json({ message: 'Something failed' })
        }
    })


/** delete user **/
router.post(
    '/delete-user',
    async (req, res) => {
        try {
            /** parse body **/
            const { userId } = req.body

            /** check userId in the request body **/
            if (!userId)
                return res.status(400).json({ message: 'userId not found in the response body' })

            /** find user by id **/
            const user = await User.findOne({ _id: userId })

            if (!user)
                return res.status(400).json({ message: 'user not found' })

            /** remove user **/
            await user.remove()

            res.status(201).json({ message: 'user has been removed' })
        }
        catch (e) {
            /** write server error to server-err.log **/
            console.error(e)
            /** send error code **/
            res.status(500).json({ message: 'Something failed' })
        }
    })

/** edit user **/
router.post(
    '/edit-user',
    async (req, res) => {
        try {
            /** parse body **/
            const { userId,
                name,
                middleName,
                lastName,
                login,
                email,
                phoneNumber,
                testAccess,
                analyticAccess,
                resultAccess,
                loginAccess,
                adminAccess } = req.body
            /** find by id **/
            const user = await User.findOne({ _id: userId })

            if (!user)
                return res.status(400).json({ message: 'user not found' })

            /** set properties **/
            user.name = name
            user.middleName = middleName
            user.lastName = lastName
            user.login = login
            user.email = email
            user.phoneNumber = phoneNumber
            const userAccess = await user.getAccess()
            userAccess.loginAccess = loginAccess
            userAccess.adminAccess = adminAccess
            userAccess.testAccess = testAccess
            userAccess.analyticAccess = analyticAccess
            userAccess.resultAccess = resultAccess

            await user.save()
            await userAccess.save()

            await res.json({ message: 'user has been modified' })
        }
        catch (e) {
            /** write server error to server-err.log **/
            console.error(e)
            /** send error code **/
            res.status(500).json({ message: 'Something failed' })
        }
    })

/** get users **/
router.get(
    '/users',
    async (req, res) => {
        try {
            /** load users **/
            const _users = await User.find().sort({ login: 1 })
            /** map users **/
            const users = await Promise.all(_users.map( async user => {
                const access = await user.getAccess()
                return {
                    userId: user._id,
                    name: user.name,
                    middleName: user.middleName,
                    lastName: user.lastName,
                    login: user.login,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    adminAccess: access.adminAccess,
                    testAccess: access.testAccess,
                    analyticAccess: access.analyticAccess,
                    resultAccess: access.resultAccess,
                    loginAccess: access.loginAccess
                }
            }))
            await res.json({ users })
        }
        catch (e) {
            /** write server error to server-err.log **/
            console.error(e)
            /** send error code **/
            res.status(500).json({ message: 'Something failed' })
        }
    })

module.exports = router