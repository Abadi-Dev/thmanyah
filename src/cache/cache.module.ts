import { Module, Global, Logger } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

const logger = new Logger('CacheModule');

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get('REDIS_HOST') || 'localhost';
        const port = parseInt(configService.get('REDIS_PORT') || '6379', 10);

        try {
          const store = await redisStore({
            socket: { host, port },
            ttl: 60 * 1000,
          });
          logger.log(`Redis cache connected to ${host}:${port}`);
          return { store };
        } catch (error) {
          logger.warn(
            `Redis connection failed, using in-memory cache: ${error}`,
          );
          return {};
        }
      },
      inject: [ConfigService],
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
