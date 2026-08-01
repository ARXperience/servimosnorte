import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TrashService } from './trash.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Papelera')
@Controller('trash')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrashController {
    constructor(private readonly trashService: TrashService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener elementos eliminados' })
    getTrash() {
        return this.trashService.getTrash();
    }

    @Post(':entity/:id/restore')
    @ApiOperation({ summary: 'Restaurar un elemento' })
    restore(@Param('entity') entity: string, @Param('id') id: string) {
        return this.trashService.restore(entity, id);
    }
}
