import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BlogService } from '../services/blog-service';
import { BlogQueryRepository } from '../repositories/blog-query-repository';
import {
  BlogQueryParams,
  CreatePostForBlogInputModel,
  QueryParamsPostForBlog,
  UpdateBlogInputModel,
} from '../types/models';
import { ViewBlog } from '../types/views';
import { PostQueryRepository } from '../../posts/repositories/post-query-repository';
import { ViewArrayPosts, ViewPost } from '../../posts/types/views';
import { IsInt, Length } from 'class-validator';

/*пример создания экземпляра класса
CreateBlogInputModel без передачи значений свойств:

--если  const blogInput = new CreateBlogInputModel()
тогда blogInput = {
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

class CreateBlogInputModel {
  /* ТАК СВОЙ ТЕКСТ ОШИБКИ МОЖНО ПРОПИСАТЬ*/
  @Length(10, 20, { message: 'Short length поля name' })
  name: string;
  @IsInt()
  description: string;
  websiteUrl: string;
}

@Controller('blogs')
export class BlogController {
  constructor(
    protected blogService: BlogService,
    protected blogQueryRepository: BlogQueryRepository,
    protected postQueryRepository: PostQueryRepository,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createBlog(
    /* ВМЕСТО ТИПИЗАЦИИ (из файла models.ts)
   делаю класс CreateBlogInputModel -И В ЭТОМ ЖЕ
    ФАЙЛЕ ЕГО ПРОПИСЫВАЮ
    И ОБЯЗАТЕЛЬНО СВЕРХУ */
    @Body() createBlogInputModel: CreateBlogInputModel,
  ): Promise<ViewBlog> {
    const id = await this.blogService.createBlog(createBlogInputModel);

    const blog = await this.blogQueryRepository.getBlogById(id);

    if (blog) {
      return blog;
    } else {
      throw new BadRequestException(['Bad']);
    }
  }

  @Get()
  async getBlogs(@Query() queryParamsBlog: BlogQueryParams) {
    const blogs = await this.blogQueryRepository.getBlogs(queryParamsBlog);
    return blogs;
  }

  @Get(':id')
  async getBlogById(@Param('id') bologId: string) {
    const blog = await this.blogQueryRepository.getBlogById(bologId);

    if (blog) {
      return blog;
    } else {
      throw new NotFoundException('blog not found:andpoint-get,url /blogs/id');
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteBlogById(@Param('id') blogId: string) {
    const isDeleteBlogById = await this.blogService.deleteBlogById(blogId);

    if (isDeleteBlogById) {
      return;
    } else {
      throw new NotFoundException(
        'blog not found:andpoint-delete,url /blogs/id',
      );
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateBlog(
    @Param('id') bologId: string,
    @Body() updateBlogInputModel: UpdateBlogInputModel,
  ) {
    const isUpdateBlog = await this.blogService.updateBlog(
      bologId,
      updateBlogInputModel,
    );

    if (isUpdateBlog) {
      return;
    } else {
      throw new NotFoundException(
        'blog not update:andpoint-put ,url /blogs/id',
      );
    }
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(':blogId/posts')
  async createPostFortBlog(
    @Param('blogId') blogId: string,
    @Body() createPostForBlogInputModel: CreatePostForBlogInputModel,
  ): Promise<ViewPost | null> {
    const postId: string | null = await this.blogService.createPostForBlog(
      blogId,
      createPostForBlogInputModel,
    );

    if (!postId) {
      throw new NotFoundException(
        'Cannot create post because blog does not exist- ' +
          ':method-post,url -blogs/:blogId /post',
      );
    }

    const post: ViewPost | null =
      await this.postQueryRepository.getPostById(postId);

    if (post) {
      return post;
    } else {
      throw new NotFoundException(
        'Cannot create post- ' + ':method-post,url -blogs/:blogId /post',
      );
    }
  }

  @Get(':blogId/posts')
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() queryParamsPostForBlog: QueryParamsPostForBlog,
  ): Promise<ViewArrayPosts> {
    const posts = await this.postQueryRepository.getPostsByCorrectBlogId(
      blogId,
      queryParamsPostForBlog,
    );

    if (posts) {
      return posts;
    } else {
      throw new NotFoundException(
        'blog or post  is not exists  ' +
          ':method-get,url -blogs/:blogId /posts',
      );
    }
  }
}
