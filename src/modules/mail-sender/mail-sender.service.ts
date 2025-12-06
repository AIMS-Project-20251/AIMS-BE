import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order, OrderStatus } from "../place-order/entities/order.entity";
import { Repository } from "typeorm";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class MailSenderService {
    constructor(
        @InjectRepository(Order) private orderRepo : Repository<Order>,
        private readonly mailerService: MailerService
    ){}

    async sendOrderSuccessEmail(orderId: number) {
        const order = await this.orderRepo.findOne({where: {id: orderId}});

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status !== OrderStatus.PAID) {
            throw new BadRequestException('Order not paid yet');
        }
        
        const context = {
            id: order.id,
            customerName: order.customerName,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
            shippingAddress: order.shippingAddress,
            city: order.city
        };

        try {
            await this.mailerService.sendMail({
                to: order.email,
                subject: `[AIMS] Xác nhận Thanh toán và Hóa đơn Đơn hàng #${order.id}`,
                template: 'invoice',
                context: context,
            });

            console.log(`Invoice email sent successfully for Order #${order.id}`);
        } catch (error) {
            console.error(`Failed to send email for Order #${order.id}:`, error);
            throw new InternalServerErrorException('Something happened while trying to send invoice')
        }

        return { message: `Email sent to ${order.id}` }
    }
}