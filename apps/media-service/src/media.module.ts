import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@mcom/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    // TypeOrmModule.forFeature([/* Add entities here */]),
  ],
  controllers: [
    // Add controllers here
  ],
  providers: [
    // Add services here
  ],
  exports: [
    // Add exports here
  ],
})
export class MediaModule {}