const User = require('../models/User');
const jwt = require('jsonwebtoken');
// const userDB = require('../models/userDB');
const userDB = require('../models/accountDB');
const { sequelize } = require('../../models');

module.exports = {
	users: {
		getUsersInfo: async (req, res) => {
			try {
				await sequelize.authenticate();
				console.log('connection to database');

				const result = await userDB.getUserInfo();
				console.log('result : ', result);
				return res.json({
					result: result,
				});
			} catch (error) {
				console.log('error : ', error);
				//TODO json 400,500 error 추가
			}
		},

		getUserInfo: async (req, res) => {
			return res.json({
				id: req.user._id,
				email: req.user.email,
				name: req.user.name,
				role: req.user.role,
				image: req.user.image,
			});
		},

		register: async (req, res, next) => {
			try {
				// console.log("1", req.body);
				const user = User(req.body);
				await user.save();
				return res.sendStatus(200);
			} catch (error) {
				next(error);
			}
		},

		login: async (req, res, next) => {
			try {
				//존재하는 유저인지 확인
				const user = await User.findOne({ email: req.body.email });
				if (!user) {
					return res.status(400).send('Auth failed, email not found');
				}
				//비밀번호 체크
				console.log('test');
				const isMatch = await user.comparePassword(req.body.password);
				if (!isMatch) {
					return res.status(400).send('Wrong Password');
				}

				const payload = {
					userId: user._id.toHexString(),
				};

				//token 생성
				const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
					expiresIn: '1h',
				});

				console.log(
					'payload : ',
					payload,
					'user : ',
					user,
					'accessToken: ',
					accessToken
				);
				return res.json({ user, accessToken });
			} catch (error) {
				next(error);
			}
		},

		logout: async (req, res, next) => {
			try {
				return res.sendStatus(200);
			} catch (error) {
				next(error);
			}
		},
	},
};