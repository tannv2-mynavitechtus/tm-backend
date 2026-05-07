import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';

describe('TasksService', () => {
  let service: TasksService;
  let repository: {
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    merge: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      merge: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject viewing another user task for non-admin', async () => {
    repository.findOne.mockResolvedValue({
      id: 99,
      reporter: { id: 2 },
      assignee: { id: 3 },
    });

    await expect(
      service.findOne(99, { id: 1, role: UserRole.USER }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should allow admin to list all tasks without ownership filter', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    await service.findAll({}, { id: 1, role: UserRole.ADMIN });

    expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ userId: 1 }),
    );
  });
});
