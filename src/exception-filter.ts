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

--НАДО ГЛОБАЛЬНО ПОДКЛЮЧИТЬ К ПРИЛОЖЕНИЮ
 app.useGlobalFilters(new HttpExceptionFilter());
в main.ts

*/

/*
ЭТО БАЗОВЫЙ КОД ИЗ ДОКУМЕНТАЦИИ --ниже я его
 изменил согласно  --как по уроку
 ибо была задача выводить определенную
 информацию о данной ошибке

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

/////////////////////////////////////////////////////
/*
такой вариант обработки ошибки делает вывод такой
в постмане

{
  "errors": [
  {
    "message": "Short length поля name"
  },
  {
    "message": "description must be an integer number"
  }
]
}
НО ЗАДАЧА МОЖЕТ БЫТЬ СЛОЖНЕЕ ---вывести поле каждой
ошибки(fuild:name)
 текст каждой ошибки по каждому полю( тоесть может несколько ошибок
 для обного поля)
*/

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
        message: exception.message,
      });
    }
  }
}
