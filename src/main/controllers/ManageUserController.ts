import { AuthedRequest } from '../interfaces/AuthedRequest';
import { Response } from 'express';
import { RootController } from './RootController';
import autobind from 'autobind-decorator';

@autobind
export class ManageUserController extends RootController {
  public get(req: AuthedRequest, res: Response) {
    return super.get(req, res, 'manage-user');
  }
}
