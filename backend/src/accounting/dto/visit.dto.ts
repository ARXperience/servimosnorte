import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartSessionDto {
    @ApiProperty({ required: false, example: '/' })
    @IsOptional()
    @IsString()
    path?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    referrer?: string;

    @ApiProperty({ required: false, example: 'es-CO' })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiProperty({ required: false, example: '1920x1080' })
    @IsOptional()
    @IsString()
    screen?: string;

    @ApiProperty({ required: false, example: 300, description: 'Minutos de desfase horario del navegador' })
    @IsOptional()
    @IsNumber()
    tzOffset?: number;
}

export class PageViewDto {
    @ApiProperty()
    @IsString()
    sessionId: string;

    @ApiProperty({ example: '/tienda' })
    @IsString()
    path: string;
}

export class HeartbeatDto {
    @ApiProperty()
    @IsString()
    sessionId: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    pageViewId?: string;

    @ApiProperty({ required: false, description: 'Segundos acumulados en la página actual' })
    @IsOptional()
    @IsNumber()
    seconds?: number;
}
