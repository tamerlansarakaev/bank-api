import { Controller } from '@nestjs/common';
import { Card } from './common/entities/card.entity';
import { ApiExtraModels } from '@nestjs/swagger';
import { User } from './common/entities/user.entity';
import { Admin } from './admin/entities/admin.entity';
import { Transaction } from './common/entities/transaction.entity';

@Controller()
@ApiExtraModels(Card, User, Admin, Transaction)
export class AppController {}
