import { Module } from '@nestjs/common';
import { RentChargesController } from './rent-charges.controller';
import { RentChargesService } from './rent-charges.service';

@Module({ controllers: [RentChargesController], providers: [RentChargesService], exports: [RentChargesService] })
export class RentChargesModule {}
