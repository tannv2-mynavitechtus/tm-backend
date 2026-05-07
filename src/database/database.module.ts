import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const useSsl = configService.get<boolean>('database.ssl');

        return {
          type: 'postgres',
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.database'),
          autoLoadEntities: true,
          synchronize: configService.get<boolean>('database.synchronize'),
          ssl: useSsl
            ? {
                rejectUnauthorized: configService.get<boolean>(
                  'database.sslRejectUnauthorized',
                ),
              }
            : false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
