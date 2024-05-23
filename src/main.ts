import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ErrorResponseType, HttpExceptionFilter } from './exception-filter';

/* вход в приложение
тут происходит настройка и запуск приложения

документация nest
https://docs.nestjs.com/*/
async function bootstrap() {
  /*  класс создает приложение на основе МОДУЛЯ
 NestFactory.create(AppModule) - Внизу строка кода создает экземпляр
  приложения NestJS на основе модуля AppModule(он в аргументе). AppModule - это корневой
   модуль вашего приложения (ОН СОЗДАЁТСЯ В ФАЙЛЕ app.module)
   который определяет все импорты, контроллеры
    и провайдеры, необходимые для функционирования вашего приложения.
     NestFactory - это класс, предоставляемый NestJS, который
      предоставляет статические методы для создания экземпляра
      приложения*/
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  /*ДЛЯ СОЗДАНИЯ ГЛОБАЛЬНОГО ПАЙПА
    КОД В АРГУМЕНТЕ --это чтоб если pipe валидация
    не прошла то выводилась ошибка определенного
    формата---поле конкретное и текст всех
    ошибок для этого поля*/
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const errorForResponse: ErrorResponseType[] = [];
        errors.forEach((e: ValidationError) => {
          const constraintsKey = Object.keys(e.constraints ?? {});
          /*constraints это {isEmail: 'name must be an email', isLength: 'Short length поля name'}
           * --и создаётся массив ключей[isEmail,isLength]*/

          constraintsKey.forEach((ckey: string) => {
            errorForResponse.push({
              message: e.constraints?.[ckey] ?? 'default message',
              field: e.property,
            });
          });
        });
        throw new BadRequestException(errorForResponse);
      },
    }),
  );

  /*https://docs.nestjs.com/exception-filters

  Exception filters
  -он в файле exception-filter.ts

---ЭТО ПЕРЕХВАТ ЛЮБОГО HTTP кода ошибки

--тут  ГЛОБАЛЬНО ПОДКЛЮЧаю К ПРИЛОЖЕНИЮ*/
  app.useGlobalFilters(new HttpExceptionFilter());

  /*  После создания экземпляра приложения, вызывается метод listen(),
 который запускает ваше приложение на указанном порту.
 В данном случае, приложение будет слушать порт 3000.*/
  await app.listen(3000);
}

bootstrap();

/*рабочий 
new ValidationPipe({
  exceptionFactory: (errors) => {
    const errorForResponse: any = [];
    errors.forEach((e) => {
      errorForResponse.push({ field: e.property });
    });
    throw new BadRequestException(errorForResponse);
  },
}),*/

/*
new ValidationPipe({
  stopAtFirstError: false,
  exceptionFactory: (errors) => {
    const errorsForResponse = [];

    errors.forEach((e) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const zeroKey = Object.keys(e.constraints[0]);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      errorsForResponse.push(e.constraints[zeroKey]);
    });

    throw new BadRequestException(errorsForResponse);
  },
}),*/
