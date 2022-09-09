/*
https://docs.nestjs.com/providers#services
*/

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { Between, FindConditions, In, Like, Repository } from 'typeorm';
import { DeptService } from 'src/modules/system/dept/dept.service';
// import { MenuService } from '../menu/menu.service';
import { ReqUserListDto } from 'src/modules/system/user/dto/req-user.dto';
import { UserService } from 'src/modules/system/user/user.service';
import {
  ReqAddProjectDto,
  // ReqAllocatedListDto,
  // ReqDataScopeDto,
  ReqProjectListDto,
} from './dto/req-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    // @Inject(forwardRef(() => MenuService))
    // private readonly menuService: MenuService,
    @Inject(forwardRef(() => DeptService))
    private readonly deptService: DeptService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) { }

  /* 新增或者编辑 */
  async addOrUpdate(reqAddProjectDto: ReqAddProjectDto) {
    // const menuArr = await this.menuService.listByIdArr(reqAddProjectDto.menuIds);
    // reqAddProjectDto.menus = menuArr;
    const dept = await this.deptService.findById(reqAddProjectDto.deptId);
    reqAddProjectDto.dept = dept;
    await this.projectRepository.save(reqAddProjectDto);
  }

  /* 分页查询 */
  async list(
    reqProjectListDto: ReqProjectListDto,
  ): Promise<PaginatedDto<Project>> {
    const where: FindConditions<Project> = {
      delFlag: '0',
    };
    if (reqProjectListDto.projectName) {
      where.projectName = Like(`%${reqProjectListDto.projectName}%`);
    }
    // if (reqProjectListDto.roleKey) {
    //     where.roleKey = Like(`%${reqProjectListDto.roleKey}%`);
    // }
    if (reqProjectListDto.status) {
      where.status = reqProjectListDto.status;
    }
    // if (reqProjectListDto.params) {
    //   where.createTime = Between(
    //     reqProjectListDto.params.beginTime,
    //     moment(reqProjectListDto.params.endTime).add(1, 'day').format(),
    //   );
    // }

    const deptId = reqProjectListDto.deptId ?? '';
    const queryBuilde = this.projectRepository.createQueryBuilder('project');
    if (deptId) {
      queryBuilde.innerJoinAndSelect(
        'project.dept',
        'dept',
        "concat('.',dept.mpath) like :v",
        { v: '%.' + deptId + '.%' },
      );
    } else {
      queryBuilde.leftJoinAndSelect('project.dept', 'dept');
    }

    const result = await queryBuilde
      .andWhere(where)
      .orderBy('project.createTime', 'DESC')
      .skip(reqProjectListDto.skip)
      .take(reqProjectListDto.take)
      .getManyAndCount();

    // const result = await this.projectRepository.findAndCount({
    //   select: [
    //     'projectId',
    //     'projectName',
    //     'createTime',
    //     'status',
    //     'createBy',
    //     'remark',
    //   ],
    //   where,
    //   order: {
    //     createTime: 1,
    //   },
    //   skip: reqProjectListDto.skip,
    //   take: reqProjectListDto.take,
    // });
    return {
      rows: result[0],
      total: result[1],
    };
  }

  /* 通过项目名获取项目,排除删除的 */
  async findOneByProjectNameState(projectName: string) {
    return await this.projectRepository.findOne({
      select: ['projectId', 'projectName', 'status', 'delFlag'],
      where: {
        projectName: projectName,
        delFlag: '0',
      },
    });
  }

  /* 通过id查询 */
  async findById(projectId: number | string) {
    const queryBuilde = this.projectRepository.createQueryBuilder('project');
    queryBuilde.leftJoinAndSelect('project.dept', 'dept');
    const project = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.dept', 'dept')
      .where({
        projectId: projectId,
      })
      .getOne();
    return project;
  }

  /* 通过id数组删除 */
  async delete(projectIdArr: string[], userName: string) {
    return await this.projectRepository
      .createQueryBuilder()
      .update()
      .set({ delFlag: '2', updateBy: userName })
      .where('projectId in (:...projectIdArr) ', { projectIdArr })
      .execute();
  }

  // /* 更新数据权限 */
  // async updateDataScope(reqDataScopeDto: ReqDataScopeDto) {
  //     let deptArr = [];
  //     if (reqDataScopeDto.deptCheckStrictly) {
  //         //如果菜单选择父子联动就需要排除 所有父级
  //         deptArr = await this.deptService.listByIdArrFilter(
  //             reqDataScopeDto.deptIds,
  //         );
  //     } else {
  //         deptArr = await this.deptService.listByIdArr(reqDataScopeDto.deptIds);
  //     }
  //     reqDataScopeDto.depts = deptArr;
  //     return await this.projectRepository.save(reqDataScopeDto);
  // }

  // /* 通过id数组查询 */
  // listByIdArr(idArr: number[]) {
  //     return this.projectRepository.find({
  //         where: {
  //             delFlag: '0',
  //             roleId: In(idArr),
  //         },
  //     });
  // }

  // /* 更改角色状态 */
  // async changeStatus(roleId: number, status: string, updateBy: string) {
  //     return await this.projectRepository
  //         .createQueryBuilder()
  //         .update()
  //         .set({ status, updateBy })
  //         .where({ roleId })
  //         .execute();
  // }

  // /* 通过角色id 分页 查询该角色下的用户列表 或 不存在的用户 */
  // async allocatedListByRoleId(
  //     reqAllocatedListDto: ReqAllocatedListDto,
  //     reverse?: boolean,
  // ) {
  //     let getUserDto = new ReqUserListDto();
  //     getUserDto = Object.assign(getUserDto, reqAllocatedListDto);
  //     return this.userService.list(
  //         getUserDto,
  //         reqAllocatedListDto.roleId,
  //         reverse,
  //     );
  // }

  // /* 取消角色下的用户 */
  // async cancel(roleId: number, userIdArr: number[] | string[]) {
  //     return await this.projectRepository
  //         .createQueryBuilder('role')
  //         .relation('users')
  //         .of(roleId)
  //         .remove(userIdArr);
  // }

  // /* 给角色添加用户 */
  // async selectAll(roleId: number, userIdArr: number[] | string[]) {
  //     return await this.projectRepository
  //         .createQueryBuilder('role')
  //         .relation('users')
  //         .of(roleId)
  //         .add(userIdArr);
  // }
}
