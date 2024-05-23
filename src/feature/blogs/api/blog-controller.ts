import {
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
} from './types/models';
import { ViewBlog } from './types/views';
import { PostQueryRepository } from '../../posts/repositories/post-query-repository';
import { ViewArrayPosts, ViewPost } from '../../posts/types/views';
import { CreateBlogInputModel } from './pipes/CreateBlogInputModel';

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
    /*
     ПАЙТ В ФАЙЛЕ   -src/feature/blogs/pipes/CreateBlogInputModel.ts
     ............
НА ДАННОМ ЭТАПЕ   ПАЙП  ЕЩЕ НЕ ПОВЕШЕН, поэтому
валидация хоть и прописана- всеравно будут создаваться
 всякие - какиеугодно документы в базе

 ДЛЯ СОЗДАНИЯ ГЛОБАЛЬНОГО ПАЙПА
вот эту строку вставить в файл main.ts
app.useGlobalPipes(new ValidationPipe());

........
     ---ДЛЯ ТИПИЗАЦИИ  ТАКЖЕ ИСПОЛЬЗУЮ  CreateBlogInputModel

     если ошибка будет-она обработается в файле
     src/exception-filter.ts*/
    @Body() createBlogInputModel: CreateBlogInputModel,
  ): Promise<ViewBlog> {
    const id = await this.blogService.createBlog(createBlogInputModel);

    const blog = await this.blogQueryRepository.getBlogById(id);

    if (blog) {
      return blog;
    } else {
      throw new NotFoundException('blog not found:andpoint-get,url');
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
