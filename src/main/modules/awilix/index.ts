import { asClass, asValue, createContainer, InjectionMode } from 'awilix';
import { Application } from 'express';
import { UserOptionController } from '../../controllers/UserOptionController';
import { AddUserController } from '../../controllers/AddUserController';
import { AddUserDetailsController } from '../../controllers/AddUserDetailsController';
import { AddUserRolesController } from '../../controllers/AddUserRolesController';
import { ManageUserController } from '../../controllers/ManageUserController';
import { UserResultsController } from '../../controllers/UserResultsController';
import { UserActionsController } from '../../controllers/UserActionsController';
import { UserDeleteController } from '../../controllers/UserDeleteController';
import { UserSuspendController } from '../../controllers/UserSuspendController';
import { FeatureFlags } from '../../app/feature-flags/FeatureFlags';
import { LaunchDarkly } from '../../app/feature-flags/LaunchDarklyClient';
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('app');
import { defaultClient } from 'applicationinsights';
import { UserEditController } from '../../controllers/UserEditController';
import { AccessibilityStatementController } from '../../controllers/AccessibilityStatementController';
import { AddPrivateBetaServiceController } from '../../controllers/AddPrivateBetaServiceController';

/**
 * Sets up the dependency injection container
 */
export class Container {

  public enableFor(app: Application): void {
    app.locals.container = createContainer({ injectionMode: InjectionMode.CLASSIC }).register({
      logger: asValue(logger),
      telemetryClient: asValue(defaultClient),
      exposeErrors: asValue(app.locals.env === 'development'),
      featureFlags: asValue(new FeatureFlags(new LaunchDarkly())),
      userOptionController: asClass(UserOptionController),
      addUserController: asClass(AddUserController),
      addUserDetailsController: asClass(AddUserDetailsController),
      addUserRolesController: asClass(AddUserRolesController),
      addPrivateBetaServiceController: asClass(AddPrivateBetaServiceController),
      manageUserController: asClass(ManageUserController),
      userEditController: asClass(UserEditController),
      userResultsController: asClass(UserResultsController),
      userActionsController: asClass(UserActionsController),
      userDeleteController: asClass(UserDeleteController),
      userSuspendController: asClass(UserSuspendController),
      accessibilityStatementController: asClass(AccessibilityStatementController)
    });
  }
}
