import Joi from '@hapi/joi';
import User from '../../models/User';

export const register = async (ctx) => {
	const schema = Joi.object().keys({
		username: Joi.string().alphanum().min(3).max(20).required(),
		password: Joi.string().required(),
	});
	const result = schema.validate(ctx.request.body);
	if (result.error) {
		ctx.status = 400;
		ctx.body = result.error;
		console.log('occur 400 error');
		return;
	}

	console.log('reqbody : ' + ctx);

	const { username, password } = ctx.request.body;
	const token = user.generateToken();
	ctx.cookies.set('access_token', token, {
		maxAge: 1000 * 60 * 60 * 24 * 7, //7일
		httponly: true,
	});
	try {
		const exists = await User.findByUsername(username);
		if (exists) {
			ctx.status = 409;
			console.log(`exists : 409`);
			return;
		}
		const user = new User({
			username,
		});
		console.log(`user : ${user}`);

		await user.setPassword(password);
		await user.save();

		ctx.body = user.serialize();
		const token = user.generateToken();
		ctx.cookies.set('access_token', token, {
			maxAge: 1000 * 60 * 60 * 24 * 7, //7일
			httponly: true,
		});
	} catch (error) {
		ctx.throw(500, error);
		console.log('log : ' + error);
	}
};

export const login = async (ctx) => {
	const { username, password } = ctx.request.body;

	if (!username || !password) {
		ctx.status = 401;
		console.log('에러 발생 401');
		return;
	}

	try {
		const user = await User.findByUsername(username);
		if (!user) {
			ctx.status = 401;
			console.log('에러 아이디가 없습니다.');
			return;
		}
		const valid = await user.checkPassword(password);
		if (!valid) {
			ctx.status = 401;
			return;
		}
		ctx.body = user.serialize();
	} catch (e) {
		ctx.throw(500, e);
	}
};

export const check = async (ctx) => {};

export const logout = async (ctx) => {};
