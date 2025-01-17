import { UserResultsController } from '../../../../main/controllers/UserResultsController';
import { mockRequest } from '../../utils/mockRequest';
import { mockResponse } from '../../utils/mockResponse';
import {
  INVALID_EMAIL_FORMAT_ERROR,
  MISSING_INPUT_ERROR,
  NO_USER_MATCHES_ERROR,
  TOO_MANY_USERS_ERROR
} from '../../../../main/utils/error';
import { when } from 'jest-when';
import { mockRootController } from '../../utils/mockRootController';
import { mockApi } from '../../utils/mockApi';
import config from 'config';
jest.mock('config');

describe('User results controller', () => {
  mockRootController();
  let req: any;
  const res = mockResponse();

  when(config.get).calledWith('providers.azure.internalName').mockReturnValue('azure');
  when(config.get).calledWith('providers.azure.externalName').mockReturnValue('eJudiciary.net');
  when(config.get).calledWith('providers.azure.idFieldName').mockReturnValue('eJudiciary User ID');
  when(config.get).calledWith('providers.moj.internalName').mockReturnValue('moj');
  when(config.get).calledWith('providers.moj.externalName').mockReturnValue('MOJ/Justice.gov.uk');
  when(config.get).calledWith('providers.moj.idFieldName').mockReturnValue('MOJ User ID');

  const controller = new UserResultsController();
  const email = 'john.smith@test.com';
  const userId = '123';
  const userId2 = '234';
  const ssoId = '456';

  beforeEach(() => {
    req = mockRequest();
  });

  test('Should render the user details page with notification banner', async () => {
    const results = [
      {
        id: userId,
        forename: 'John',
        surname: 'Smith',
        email: email,
        active: true,
        roles: ['IDAM_SUPER_USER'],
        multiFactorAuthentication: true,
        ssoId: ssoId,
        ssoProvider: 'azure',
        createDate: '',
        lastModified: ''
      }
    ];

    when(mockApi.searchUsersByEmail).calledWith(email).mockResolvedValue(results);
    when(mockApi.getUserById).calledWith(userId).mockResolvedValue(results[0]);

    req.body.search = email;
    req.scope.cradle.api = mockApi;
    req.session = { user: { assignableRoles: [] } };
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('user-details', {
      content: {
        user: results[0],
        canManage: false,
        providerIdField: 'eJudiciary User ID',
        providerName: 'eJudiciary.net',
        notificationBannerMessage: 'Please check with the eJudiciary support team to see if there are related accounts.',
        lockedMessage: ''
      }
    });
  });

  test('Should render the user details page when searching with a valid email', async () => {
    const results = [
      {
        id: userId,
        forename: 'John',
        surname: 'Smith',
        email: email,
        active: true,
        roles: ['IDAM_SUPER_USER'],
        multiFactorAuthentication: true,
        ssoId: ssoId,
        createDate: '',
        lastModified: ''
      }
    ];

    when(mockApi.searchUsersByEmail).calledWith(email).mockResolvedValue(results);
    when(mockApi.getUserById).calledWith(userId).mockResolvedValue(results[0]);

    req.body.search = email;
    req.scope.cradle.api = mockApi;
    req.session = { user: { assignableRoles: [] } };
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('user-details', {
      content: {
        user: results[0],
        canManage: false,
        lockedMessage: ''
      }
    });
  });

  test('Should render the user details page when searching with a valid email and SSO Provider', async () => {
    const results = [
      {
        id: userId,
        forename: 'John',
        surname: 'Smith',
        email: email,
        active: true,
        roles: ['IDAM_SUPER_USER'],
        multiFactorAuthentication: true,
        ssoProvider: 'azure',
        ssoId: ssoId,
        createDate: '',
        lastModified: ''
      }
    ];

    when(mockApi.searchUsersByEmail).calledWith(email).mockResolvedValue(results);
    when(mockApi.getUserById).calledWith(userId).mockResolvedValue(results[0]);

    req.body.search = email;
    req.scope.cradle.api = mockApi;
    req.session = { user: { assignableRoles: [] } };
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('user-details', {
      content: {
        user: results[0],
        canManage: false,
        lockedMessage: '',
        providerName: 'eJudiciary.net',
        notificationBannerMessage: 'Please check with the eJudiciary support team to see if there are related accounts.',
        providerIdField: 'eJudiciary User ID'
      }
    });
  });

  test('Should render the default provider fields with unrecognised provider name', async () => {
    const results = [
      {
        id: userId,
        forename: 'John',
        surname: 'Smith',
        email: email,
        active: true,
        roles: ['IDAM_SUPER_USER'],
        multiFactorAuthentication: true,
        ssoProvider: 'unknown',
        ssoId: ssoId,
        createDate: '',
        lastModified: ''
      }
    ];

    when(mockApi.searchUsersByEmail).calledWith(email).mockResolvedValue(results);
    when(mockApi.getUserById).calledWith(userId).mockResolvedValue(results[0]);

    req.body.search = email;
    req.scope.cradle.api = mockApi;
    req.session = { user: { assignableRoles: [] } };
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('user-details', {
      content: {
        user: results[0],
        canManage: false,
        lockedMessage: '',
        providerName: 'unknown',
        providerIdField: 'IdP User ID'
      }
    });
  });

  test('Should render the user details page when searching with a valid user ID', async () => {
    const results = [
      {
        id: userId,
        forename: 'John',
        surname: 'Smith',
        email: email,
        active: true,
        roles: ['IDAM_SUPER_USER'],
        multiFactorAuthentication: true,
        ssoId: ssoId,
        createDate: '',
        lastModified: ''
      }
    ];

    when(mockApi.getUserById).calledWith(userId).mockReturnValue(results[0]);
    when(mockApi.searchUsersBySsoId).calledWith(userId).mockReturnValue([]);

    req.body.search = userId;
    req.scope.cradle.api = mockApi;
    req.session = { user: { assignableRoles: [] } };
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('user-details', {
      content: {
        user: results[0],
        canManage: false,
        lockedMessage: ''
      }
    });
  });

  test('Should render the user details page when searching with a valid SSO ID', async () => {
    const results = [
      {
        id: userId,
        forename: 'John',
        surname: 'Smith',
        email: email,
        active: true,
        roles: ['IDAM_SUPER_USER'],
        multiFactorAuthentication: true,
        ssoId: ssoId,
        createDate: '',
        lastModified: ''
      }
    ];

    when(mockApi.getUserById).calledWith(ssoId).mockReturnValue([]);
    when(mockApi.searchUsersBySsoId).calledWith(ssoId).mockReturnValue(results);

    req.body.search = ssoId;
    req.scope.cradle.api = mockApi;
    req.session = { user: { assignableRoles: [] } };
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('user-details',{
      content: {
        user: results[0],
        canManage: false,
        lockedMessage: ''
      }
    });
  });

  test('Should render the user details page when searching for a user with idam-mfa-disabled role', async () => {
    const users = [
      {
        id: userId,
        forename: 'John',
        surname: 'Smith',
        email: email,
        active: true,
        roles: ['IDAM_SUPER_USER', 'idam-mfa-disabled'],
        ssoId: ssoId,
        createDate: '',
        lastModified: ''
      }
    ];

    const expectedResults = [
      {
        id: userId,
        forename: 'John',
        surname: 'Smith',
        email: email,
        active: true,
        roles: ['IDAM_SUPER_USER'],
        multiFactorAuthentication: false,
        ssoId: ssoId,
        createDate: '',
        lastModified: ''
      }
    ];
    when(mockApi.searchUsersByEmail).calledWith(email).mockReturnValue(users);
    when(mockApi.getUserById).calledWith(userId).mockReturnValue(users[0]);

    req.body.search = email;
    req.scope.cradle.api = mockApi;
    req.session = { user: { assignableRoles: [] } };
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('user-details', {
      content: {
        user: expectedResults[0],
        canManage: false,
        lockedMessage: ''
      }
    });
  });

  test('Should render the user details page when searching for a locked user', async () => {
    const searchUserResults = [
      {
        id: userId,
        forename: 'John',
        surname: 'Smith',
        email: email,
        active: true,
        roles: ['IDAM_SUPER_USER'],
        multiFactorAuthentication: true,
        ssoId: ssoId,
        createDate: '',
        lastModified: ''
      }
    ];

    const currentTime = new Date();
    const pwdAccountLockedTime = new Date(currentTime);
    pwdAccountLockedTime.setMinutes(pwdAccountLockedTime.getMinutes() - 2);

    const getUserByIdResult = {
      id: userId,
      forename: 'John',
      surname: 'Smith',
      email: email,
      active: true,
      locked: true,
      pwdAccountLockedTime: pwdAccountLockedTime,
      roles: ['IDAM_SUPER_USER'],
      multiFactorAuthentication: true,
      ssoId: ssoId,
      createDate: '',
      lastModified: ''
    };

    when(mockApi.searchUsersByEmail).calledWith(email).mockResolvedValue(searchUserResults);
    when(mockApi.getUserById).calledWith(userId).mockResolvedValue(getUserByIdResult);

    req.body.search = email;
    req.scope.cradle.api = mockApi;
    req.session = { user: { assignableRoles: [] } };
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('user-details', {
      content: {
        user: getUserByIdResult,
        canManage: false,
        lockedMessage: 'This account has been temporarily locked due to multiple failed login attempts. The temporary lock will end in 58 minutes'
      }
    });
  });

  test('Should render the user details page when searching for a locked user which will be unlocked in a minute', async () => {
    const searchUserResults = [
      {
        id: userId,
        forename: 'John',
        surname: 'Smith',
        email: email,
        active: true,
        roles: ['IDAM_SUPER_USER'],
        multiFactorAuthentication: true,
        ssoId: ssoId,
        createDate: '',
        lastModified: ''
      }
    ];

    const currentTime = new Date();
    const pwdAccountLockedTime = new Date(currentTime);
    pwdAccountLockedTime.setMinutes(pwdAccountLockedTime.getMinutes() - 59);

    const getUserByIdResult = {
      id: userId,
      forename: 'John',
      surname: 'Smith',
      email: email,
      active: true,
      locked: true,
      pwdAccountLockedTime: pwdAccountLockedTime,
      roles: ['IDAM_SUPER_USER'],
      multiFactorAuthentication: true,
      ssoId: ssoId,
      createDate: '',
      lastModified: ''
    };

    when(mockApi.searchUsersByEmail).calledWith(email).mockResolvedValue(searchUserResults);
    when(mockApi.getUserById).calledWith(userId).mockResolvedValue(getUserByIdResult);

    req.body.search = email;
    req.scope.cradle.api = mockApi;
    req.session = { user: { assignableRoles: [] } };
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('user-details', {
      content: {
        user: getUserByIdResult,
        canManage: false,
        lockedMessage: 'This account has been temporarily locked due to multiple failed login attempts. The temporary lock will end in 1 minute'
      }
    });
  });

  test('Should render the user details page when searching for a locked user which is close to being unlocked', async () => {
    const searchUserResults = [
      {
        id: userId,
        forename: 'John',
        surname: 'Smith',
        email: email,
        active: true,
        roles: ['IDAM_SUPER_USER'],
        multiFactorAuthentication: true,
        ssoId: ssoId,
        createDate: '',
        lastModified: ''
      }
    ];

    const currentTime = new Date();
    const pwdAccountLockedTime = new Date(currentTime);
    pwdAccountLockedTime.setMinutes(pwdAccountLockedTime.getMinutes() - 59);
    pwdAccountLockedTime.setSeconds(pwdAccountLockedTime.getSeconds() - 50);

    const getUserByIdResult = {
      id: userId,
      forename: 'John',
      surname: 'Smith',
      email: email,
      active: true,
      locked: true,
      pwdAccountLockedTime: pwdAccountLockedTime,
      roles: ['IDAM_SUPER_USER'],
      multiFactorAuthentication: true,
      ssoId: ssoId,
      createDate: '',
      lastModified: ''
    };

    when(mockApi.searchUsersByEmail).calledWith(email).mockResolvedValue(searchUserResults);
    when(mockApi.getUserById).calledWith(userId).mockResolvedValue(getUserByIdResult);

    req.body.search = email;
    req.scope.cradle.api = mockApi;
    req.session = { user: { assignableRoles: [] } };
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('user-details', {
      content: {
        user: getUserByIdResult,
        canManage: false,
        lockedMessage: ''
      }
    });
  });

  test('Should render the manage user page when searching with a non-existent email', async () => {
    when(mockApi.searchUsersByEmail).calledWith(email).mockReturnValue([]);

    req.body.search = email;
    req.scope.cradle.api = mockApi;
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('manage-user', { error: { search: { message: NO_USER_MATCHES_ERROR + email } } });
  });

  test('Should render the manage user page when searching with a non-existent ID', async () => {
    when(mockApi.getUserById).calledWith(userId).mockRejectedValue('');
    when(mockApi.searchUsersBySsoId).calledWith(userId).mockResolvedValue([]);

    req.body.search = userId;
    req.scope.cradle.api = mockApi;
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('manage-user', { error: { search: { message: NO_USER_MATCHES_ERROR + userId } } });
  });

  test('Should render the manage user page when more than one emails matches the search input', async () => {
    const results = [
      {
        id: userId,
        forename: 'John',
        surname: 'Smith',
        email: email,
        active: true,
        roles: ['IDAM_SUPER_USER'],
        ssoId: ssoId
      },
      {
        id: userId2,
        forename: 'J',
        surname: 'Smith',
        email: email,
        active: true,
        roles: ['IDAM_ADMIN_USER'],
        ssoId: userId
      }
    ];
    when(mockApi.searchUsersByEmail).calledWith(email).mockResolvedValue(results);

    req.body.search = email;
    req.scope.cradle.api = mockApi;
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('manage-user', { error: { search: { message: TOO_MANY_USERS_ERROR + email } } });
  });

  test('Should render the manage user page when more than one SSO IDs matches the search input', async () => {
    const results = [
      {
        id: userId,
        forename: 'John',
        surname: 'Smith',
        email: email,
        active: true,
        roles: ['IDAM_SUPER_USER'],
        ssoId: ssoId
      },
      {
        id: userId2,
        forename: 'Mike',
        surname: 'Green',
        email: email,
        active: false,
        roles: ['IDAM_ADMIN_USER'],
        ssoId: ssoId
      }
    ];
    when(mockApi.getUserById).calledWith(ssoId).mockRejectedValue('');
    when(mockApi.searchUsersBySsoId).calledWith(ssoId).mockResolvedValue(results);

    req.body.search = ssoId;
    req.scope.cradle.api = mockApi;
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('manage-user', { error: { search: { message: TOO_MANY_USERS_ERROR + ssoId } } });
  });

  test('Should render the manage user page with error when searching with empty input', async () => {
    req.body.search = '';
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('manage-user', { error: { search: { message: MISSING_INPUT_ERROR } } });
  });

  test('Should render the manage user page with error when searching with email with invalid format', async () => {
    req.body.search = 'test@test';
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('manage-user', { error: { search: { message: INVALID_EMAIL_FORMAT_ERROR } }});
  });
});
