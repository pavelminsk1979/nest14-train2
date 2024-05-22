import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exception-filter';

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

  /*ДЛЯ СОЗДАНИЯ ГЛОБАЛЬНОГО ПАЙПА */
  app.useGlobalPipes(new ValidationPipe());

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
