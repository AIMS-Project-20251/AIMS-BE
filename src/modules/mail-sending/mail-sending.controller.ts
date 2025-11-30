import { Body, Controller, Post } from "@nestjs/common";
import { MailSendingService } from "./mail-sending.service";
import { ApiBody } from "@nestjs/swagger";
import { CreateProductDto } from "./dto/send-invoice.dto";

@Controller('mail-sending')
export class MailSendingController {
    constructor(private readonly mailSendingService : MailSendingService) { }

    @ApiBody({
        schema: {
          type: 'object',
          properties: {
            orderId: { type: 'string', example: "123" },
          },
          required: ['orderId'],
        },
      })
    @Post('send-invoice')
    sendInvoice(@Body() body: CreateProductDto) {
        return this.mailSendingService.sendOrderSuccessEmail(body.orderId);
    }
}