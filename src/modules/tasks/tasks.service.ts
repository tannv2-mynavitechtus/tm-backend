import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async findAll(
    query: any = {},
  ): Promise<{ data: Task[]; total: number; page: number; lastPage: number }> {
    const { status, search, page = 1, limit = 10 } = query;
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.reporter', 'reporter')
      .orderBy('task.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page: Number(page),
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignee', 'reporter'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async create(createTaskDto: CreateTaskDto, user: any): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      reporter: { id: user.id }, // set reporter to the current user
    });

    // Assignee is set via ID if provided in DTO
    if (createTaskDto.assigneeId) {
      task.assignee = { id: createTaskDto.assigneeId } as any;
    }

    return this.taskRepository.save(task);
  }

  // Ownership: user can only update if they are assignee, reporter, or ADMIN.
  // State machine logic: TODO -> DOING -> RESOLVED.
  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    user: any,
  ): Promise<Task> {
    const task = await this.findOne(id);

    // Ownership check
    const isOwner = task.reporter?.id === user.id;
    const isAssignee = task.assignee?.id === user.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isOwner && !isAssignee && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to update this task',
      );
    }

    // State machine basic logic (example: allow any progress, but can be customized)
    if (updateTaskDto.status) {
      if (
        task.status === TaskStatus.TODO &&
        updateTaskDto.status === TaskStatus.RESOLVED
      ) {
        throw new BadRequestException(
          'Cannot skip from TODO direct to RESOLVED',
        );
      }
    }

    if (updateTaskDto.assigneeId) {
      task.assignee = { id: updateTaskDto.assigneeId } as any;
      delete updateTaskDto.assigneeId;
    }

    const updatedTask = this.taskRepository.merge(task, updateTaskDto);
    return this.taskRepository.save(updatedTask);
  }

  async remove(id: number, user: any): Promise<void> {
    const task = await this.findOne(id);

    const isOwner = task.reporter?.id === user.id;
    const isAdmin = user.role === UserRole.ADMIN;

    // Only Owner or Admin can delete
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this task',
      );
    }

    const result = await this.taskRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }
}
