import Post from '../../modles/post';
import mongoose from 'mongoose';

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
	try {
		const posts = await Post.find().exec();
		ctx.body = posts;
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
