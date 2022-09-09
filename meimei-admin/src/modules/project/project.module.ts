import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Project } from './entities/project.entity';

import { DeptModule } from 'src/modules/system/dept/dept.module';
import { UserModule } from 'src/modules/system/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    forwardRef(() => DeptModule),
    forwardRef(() => UserModule),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule { }
