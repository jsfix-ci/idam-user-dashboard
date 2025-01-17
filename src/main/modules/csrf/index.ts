import csrf from 'csurf';
import { Application, NextFunction, Response, Request } from 'express';

export class Csrf {
  public enableFor(app: Application): void {
    app.use(process.env.NODE_ENV === 'production' ? csrf() : csrf({ ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'] }),
      (req: Request, res: Response, next: NextFunction) => {
        res.locals.csrfToken = req.csrfToken();
        next();
      });
  }
}
