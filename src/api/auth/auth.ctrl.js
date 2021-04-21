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

		const data = user.toJSON();

		delete data.hashedPassword;
		ctx.body = data;
	} catch (error) {
		ctx.throw(500, error);
		console.log('log : ' + error);
	}
};

export const login = async (ctx) => {};

export const check = async (ctx) => {};

export const logout = async (ctx) => {};
