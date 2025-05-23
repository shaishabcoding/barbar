import { UserServices } from './User.service';
import catchAsync from '../../../util/server/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { StatusCodes } from 'http-status-codes';
import { userExcludeFields } from './User.constant';
import { AuthServices } from '../auth/Auth.service';

export const UserControllers = {
  create: catchAsync(async ({ body }, res) => {
    const user = await UserServices.create(body);

    const { accessToken, refreshToken } = await AuthServices.retrieveToken(
      user._id!,
    );

    AuthServices.setRefreshToken(res, refreshToken);

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: `${body.role.charAt(0).toUpperCase() + body.role.slice(1)} registered successfully!`,
      data: {
        token: accessToken,
        user,
      },
    });
  }),

  edit: catchAsync(async ({ body, user }, res) => {
    const data = await UserServices.edit({
      ...body,
      oldAvatar: user?.avatar,
      _id: user?._id,
    });

    serveResponse(res, {
      message: 'Profile updated successfully!',
      data,
    });
  }),

  changePassword: catchAsync(async ({ user, body }, res) => {
    await UserServices.changePassword(user as any, body);

    serveResponse(res, {
      message: 'Password changed successfully!',
    });
  }),

  list: catchAsync(async (req, res) => {
    const { meta, users } = await UserServices.list(req.query);

    serveResponse(res, {
      message: 'Users retrieved successfully!',
      meta,
      data: users,
    });
  }),

  me: catchAsync(({ user }: any, res) => {
    userExcludeFields.forEach(field => (user[field] = undefined));

    serveResponse(res, {
      message: 'Profile fetched successfully!',
      data: user,
    });
  }),
};
