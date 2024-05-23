import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

///////////////////////////////////////////////////////

//ЭТО 1 вариант -базовый из документации

////////////////////////////////////////////////

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

///////////////////////////////////////////////////////

//ЭТО 2 вариант  не сложный

////////////////////////////////////////////////

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

/*@Catch(HttpException)
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
}*/

///////////////////////////////////////////////////////
////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

/*ЭТО 3 вариант  сложный
ЗАДАЧА  ---вывести поле каждой
ошибки(fuild:name)
текст каждой ошибки по каждому полю
message: textError




----ВОТ ТАКОЙ ВЫВОД ОШИБКИ БУДЕТ
{
    "errors": [
        {
            "message": "Short length поля name",
            "field": "name"
        },
        {
            "message": "name must be an email",
            "field": "name"
        },
        {
            "message": "description should not be empty",
            "field": "description"
        }
    ]
}
------я специально сделал две ошибки для поля name
  @IsEmail()
  @Length(10, 20, { message: 'Short length поля name' })
  name: string;


*/

/*изменения также  в  файле  main.ts
 в строке     app.useGlobalPipes(new ValidationPipe()); 
   
  --- ВОТ ТАКОЙ ТАМ КОД 
     app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const errorForResponse: any = [];
        errors.forEach((e) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          const constraintsKey = Object.keys(e.constraints);

          constraintsKey.forEach((ckey) => {
            errorForResponse.push({
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              message: e.constraints[ckey],
              field: e.property,
            });
          });
        });
        throw new BadRequestException(errorForResponse);
      },
    }),
  );*/

////////////////////////////////////////////////
export type ErrorResponseType = {
  message: string;
  field: string;
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 400) {
      const errorResponse: { errors: ErrorResponseType[] } = {
        errors: [],
      };

      const responseBody: any = exception.getResponse();

      responseBody.message.forEach((m) => {
        return errorResponse.errors.push(m);
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
