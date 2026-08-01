import { Controller, Post, Body, Get, Put, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Iniciar sesión' })
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto.email, dto.password);
    }

    @Post('register')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Registrar nuevo usuario (solo admin)' })
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto.email, dto.password, dto.name, dto.role);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
    async profile(@Request() req) {
        const user = await this.authService.findById(req.user.userId);
        if (!user) return null;
        const { passwordHash, ...result } = user;
        return result;
    }

    @Get('users')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener todos los usuarios' })
    async getUsers() {
        return this.authService.findAllUsers();
    }

    @Put('users/:id/password')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cambiar contraseña de usuario' })
    async updatePassword(@Param('id') id: string, @Body() body: any) {
        return this.authService.updateUserPassword(id, body.password);
    }

    @Delete('users/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar usuario' })
    async deleteUser(@Param('id') id: string) {
        await this.authService.deleteUser(id);
        return { message: 'Usuario eliminado' };
    }

    @Post('seed')
    @ApiOperation({ summary: 'Crear usuario admin por defecto' })
    async seed() {
        await this.authService.seedAdmin();
        return { message: 'Admin creado exitosamente' };
    }
}
