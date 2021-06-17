'use strict'
const { Router } = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const jwtSecret = "secret key"
const { check, validationResult} = require('express-validator')
const router = Router()
const User = require('../models/User')

/** Login "POST" request **/
router.post(
    '/login',
    [
        /** login validator **/
        check('login', 'incorrect login').exists().notEmpty(),
        /** password validator **/
        check('password', 'incorrect password').exists().notEmpty()
        //TODO add frontend form validation
    ],
    async (req, res) => {
        try {

            /** validate results **/
            const errors = validationResult(req)

            /** if it is empty continue login **/
            if (!errors.isEmpty()) {
                return res.status(400).json( {
                    errors: errors.array(),
                    message: 'incorrect login data'
                } )
            }

            /** extract "email" and "password" data from request body **/
            const { login, password } = req.body

            /** search user by email **/
            const user = await User.findOne({ login })

            /** if user doesn`t exist send error status plus message **/
            if (!user) {
                return res.status(400).json({ message: 'user not found' })
            }

            /** check user password **/
            const checkPassword = await bcrypt.compare(password, user.password)

            /** if password isn`t matched send error status plus message **/
            if (!checkPassword)
                return res.status(400).json({ message: 'incorrect password' })

            /** user access **/
            const userAccess = await user.getAccess()

            /** if user hasn`t login access **/
            if (userAccess && !userAccess.loginAccess)
                return res.status(403).json({ message: 'access forbidden' })

            /** create web-token **/
            const token = jwt.sign(
                { userId: user._id },
               jwtSecret,
                { expiresIn: '24h' }
            )

            /** send token and user id **/
            await res.json({ token, userId: user._id, message: 'Successfully login' })

        }
        catch (e) {
            /** write server error to server-err.log **/
            console.error(e)
            /** send error code **/
            res.status(500).json({ message: 'Something failed' })
        }
    })


module.exports = router