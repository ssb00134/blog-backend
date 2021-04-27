import jwt, { decode } from 'jsonwebtoken';
import User from '../models/User';

const jwtMiddleware = async (ctx, next) => {
	const token = ctx.cookies.get('access_token');
	if (!token) {
		console.log('토큰이 없습니다.');
		return next(); // 토큰이 없음
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log(decoded);
		ctx.state.user = {
			_id: decoded._id,
			username: decode.username,
		};

		const now = Math.floor(Date.now() / 1000);
		if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
			const user = await User.findById(decode._id);
			const token = user.generateToken();
			ctx.cookies.set('access_token', token, {
				maxAge: 1000 * 60 * 60 * 24 * 7,
				httponly: true,
			});
		}
		return next();
	} catch (e) {
		// 토큰 검증 실패
		return next();
	}
};

export default jwtMiddleware;
