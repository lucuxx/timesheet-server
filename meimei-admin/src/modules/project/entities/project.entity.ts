import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Excel } from 'src/modules/common/excel/excel.decorator';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Dept } from 'src/modules/system/dept/entities/dept.entity';
import { User } from 'src/modules/system/user/entities/user.entity';

@Entity()
export class Project extends BaseEntity {
  /* 项目ID */
  @PrimaryGeneratedColumn({
    name: 'project_id',
    comment: '项目ID',
    type: 'int',
  })
  @Type()
  @IsNumber()
  @Excel({
    name: '项目ID',
  })
  projectId: number;

  /* 项目名称 */
  @Column({
    name: 'project_name',
    comment: '项目名称',
    length: 30,
  })
  @IsString()
  @Excel({
    name: '项目名称',
  })
  projectName: string;

  /* 项目状态（0正常 1停用） */
  @Column({
    name: 'status',
    comment: '项目状态（0正常 1停用）',
    length: 1,
    type: 'char',
  })
  @IsString()
  @Excel({
    name: '项目状态',
    dictType: 'sys_normal_disable',
  })
  status: string;

  @Column({
    name: 'del_flag',
    comment: '删除标志（0代表存在 2代表删除）',
    length: 1,
    type: 'char',
    default: '0',
  })
  @ApiHideProperty()
  delFlag: string;

  @ApiHideProperty()
  @ManyToOne(() => Dept, (dept) => dept.projects)
  dept: Dept;

  @ApiHideProperty()
  @ManyToMany(() => User, (user) => user.projects)
  users: User[];
}
