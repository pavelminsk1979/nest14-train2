/*пример создания экземпляра класса
CreateBlogInputModel :

--если  const blogInput = new CreateBlogInputModel()

будет создан инстанс --- blogInput = {
name: undefined,
  description: undefined,
   websiteUrl: undefined}

   ---но можно потом в коде значения добавлять
   blogInput.name = 'Название блога';

   /////////////////////////////////////

   https://github.com/typestack/class-validator
   ТУТ МНОЖЕСТВО ДЕКОРАТОРОВ которые
   определят правила валидации

---   @Length(10, 20) -длинна приходящей строки

--- import { Length } from 'class-validator';

........................

---@IsEmail()  это именно емаил

...................

@IsNotEmpty()
...................

  @IsInt()  ---целое число,НЕОТРИЦАТЕЛЬНОЕ.Именно ЧИСЛО
  @Min(0)--- чтоб обязательно было значение

.....................

НА ДАННОМ ЭТАПЕ   ПАЙП  ЕЩЕ НЕ ПОВЕШЕН, поэтому
валидация хоть и прописана- всеравно будут создаваться
такие всякие документы в базе

 ДЛЯ СОЗДАНИЯ ГЛОБАЛЬНОГО ПАЙПА
app.useGlobalPipes(new ValidationPipe());
вот эту строку вставить в файл main.ts


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();

.......

ВАЛИДАЦИЯ ЗАРАБОТАЛА ПОСЛЕ ЗАКРЫТИЯ
И ОТКРЫТИЯ ВЕБШТОРМА!!!!

--теперь если из постмана отправить
name с малым количеством символов то будет ошибка
{
    "message": [
        "name must be longer than or equal to 10 characters"
    ],
    "error": "Bad Request",
    "statusCode": 400
}

/////////////////////////////////

*/

import { Length } from 'class-validator';

export class CreateBlogInputModel {
  /* ТАК СВОЙ ТЕКСТ ОШИБКИ МОЖНО ПРОПИСАТЬ*/

  @Length(5, 20, { message: 'Short length поля name' })
  name: string;

  @Length(5, 20, { message: 'Short length поля description' })
  description: string;
  websiteUrl: string;
}
