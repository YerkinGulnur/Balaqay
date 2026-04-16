import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './modules/auth/auth.module';
import { ChildrenModule } from './modules/children/children.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { ProgressModule } from './modules/progress/progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // ── Schedule (daily assignment cron) ─────────────────────
    ScheduleModule.forRoot(),

    // ── Database ─────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 5432),
        username: cfg.get('DB_USER', 'postgres'),
        password: cfg.get('DB_PASSWORD', 'postgres'),
        database: cfg.get('DB_NAME', 'balaqay'),
        // We use raw SQL scripts for schema, TypeORM only for ORM access
        synchronize: false,
        autoLoadEntities: true,
        logging: cfg.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // ── Feature modules ───────────────────────────────────────
    AuthModule,
    ChildrenModule,
    TasksModule,
    AssignmentsModule,
    ProgressModule,
  ],
})
export class AppModule {}
