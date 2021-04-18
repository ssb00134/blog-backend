import Post from '../../modles/post';
import mongoose from 'mongoose';
import Joi from '@hapi/joi';
const { ObjectId } = mongoose.Types;

export const checkObjectId = (ctx, next) => {
	const { id } = ctx.params;
	if (!ObjectId.isValid(id)) {
		ctx.status = 400;
		return;
	}
	return next();
};

export const write = async (ctx) => {
	console.log('write 실행');
	const schema = Joi.object().keys({
		title: Joi.string().required(),
		body: Joi.string().required(),
		tags: Joi.array().items(Joi.string()).required(),
	});

	const result = schema.validate(ctx.request.body);
	if (result.error) {
		ctx.status = 400;
		ctx.body = result.error;
		return;
	}
	console.log('post 실행 write 실행');
	const { title, body, tags } = ctx.request.body;
	const post = new Post({
		title,
		body,
		tags,
	});
	try {
		await post.save();
		ctx.body = post;
	} catch (error) {
		console.log('error 발생 500');
		ctx.throw(500, error);
	}
};

export const list = async (ctx) => {
	const page = parseInt(ctx.query.page || '1', 10);
	if (page < 1) {
		ctx.status = 400;
		return;
	}
	console.log('list 실행');
	try {
		const posts = await Post.find()
			.sort({ _id: -1 })
			.limit(10)
			.skip((page - 1) * 10)
			.exec();
		ctx.body = posts
			.map((post) => post.toJSON())
			.map((post) => ({
				...post,
				body: post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}`,
			}));
		const postCount = await Post.countDocuments().exec();
		ctx.set('Last-Page', Math.ceil(postCount / 10));
	} catch (error) {
		console.log('error 발생 500');
		ctx.throw(500, e);
	}
};
export const read = async (ctx) => {
	const { id } = ctx.params;
	console.log('read 실행 id : ' + id);
	try {
		const post = await Post.findById(id).exec();
		if (!post) {
			ctx.status = 404;
			return;
		}
		ctx.body = post;
	} catch (error) {
		console.log('error 발생 500');
		ctx.throw(500, e);
	}
};
export const remove = async (ctx) => {
	const { id } = ctx.params;
	try {
		await Post.findByIdAndRemove(id).exec();
		ctx.status = 204;
	} catch (error) {
		console.log('500에러 발생');
		ctx.throw(500, e);
	}
};
export const update = async (ctx) => {
	const { id } = ctx.params;
	console.log('update 샐행');

	const schema = Joi.object().keys({
		title: Joi.string().required(),
		body: Joi.string().required(),
		tags: Joi.array().items(Joi.string()),
	});

	const result = schema.validate(ctx.request.body);
	if (result.error) {
		ctx.status = 400;
		ctx.body = result.error;
		console.log('error 발생 404');
		return;
	}

	try {
		const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
			new: true,
		}).exec();
		if (!post) {
			ctx.status = 404;
			return;
		}
		ctx.body = post;
	} catch (error) {
		console.log('500 에러');
		ctx.throw(500, e);
	}
};