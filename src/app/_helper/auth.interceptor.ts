import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StorageService } from '../core/services/storage.service';
import { LoaderService } from '../core/services/loader.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private storage: StorageService,
    private router: Router,
    private loader: LoaderService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loader.show();
    const token = this.storage.getToken();

    const authReq = token
      ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.storage.clearAll();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      }),
      finalize(() => {
        setTimeout(() => {
          this.loader.hide();
        }, 1000);
      })
    );
  }
}
