import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Repair } from '../repairs/entities/repair.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../auth/entities/user.entity';
import { Conversation } from '../chatbot/entities/conversation.entity';

@Injectable()
export class TrashService {
    constructor(
        @InjectRepository(Customer) private customerRepo: Repository<Customer>,
        @InjectRepository(Repair) private repairRepo: Repository<Repair>,
        @InjectRepository(Product) private productRepo: Repository<Product>,
        @InjectRepository(Order) private orderRepo: Repository<Order>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Conversation) private convRepo: Repository<Conversation>,
    ) {}

    async getTrash() {
        const [customers, repairs, products, orders, users, conversations] = await Promise.all([
            this.customerRepo.find({ withDeleted: true, where: { deletedAt: Not(IsNull()) } }),
            this.repairRepo.find({ withDeleted: true, where: { deletedAt: Not(IsNull()) } }),
            this.productRepo.find({ withDeleted: true, where: { deletedAt: Not(IsNull()) } }),
            this.orderRepo.find({ withDeleted: true, where: { deletedAt: Not(IsNull()) } }),
            this.userRepo.find({ withDeleted: true, where: { deletedAt: Not(IsNull()) } }),
            this.convRepo.find({ withDeleted: true, where: { deletedAt: Not(IsNull()) } }),
        ]);

        return { customers, repairs, products, orders, users, conversations };
    }

    async restore(entity: string, id: string) {
        let repo: Repository<any>;
        switch(entity) {
            case 'customers': repo = this.customerRepo; break;
            case 'repairs': repo = this.repairRepo; break;
            case 'products': repo = this.productRepo; break;
            case 'orders': repo = this.orderRepo; break;
            case 'users': repo = this.userRepo; break;
            case 'conversations': repo = this.convRepo; break;
            default: throw new NotFoundException('Entidad no soportada');
        }
        await repo.restore(id);
        return { success: true };
    }
}
