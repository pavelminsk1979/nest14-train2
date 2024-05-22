import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

/*https://docs.nestjs.com/exception-filters

  Exception filters

---ЭТО ПЕРЕХВАТ ЛЮБОГО HTTP кода ошибки

--НАДО ГЛОБАЛЬНО ПОДКЛЮЧИТЬ К ПРИЛОЖЕНИЮ*/

/*
ЭТО БАЗОВЫЙ КОД ИЗ ДОКУМЕНТАЦИИ --ниже я его
как по уроку изменил
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}*/

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 400) {
      const errorResponse = {
        errors: [],
      };

      const responseBody: any = exception.getResponse();

      responseBody.message.forEach((m) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        return errorResponse.errors.push({ message: m });
      });

      response.status(status).json(errorResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}

/*
ВОТ ТОЛЬКО ТАКИМ КОДОМ ПОСТМАН ВЫВЕЛ ТАКУЮ ОШИБКУ
{
  "errors": [
  "name must be longer than or equal to 10 characters",
  "description must be longer than or equal to 10 characters"
]
}*/
