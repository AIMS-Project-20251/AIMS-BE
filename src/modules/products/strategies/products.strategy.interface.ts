import { CreateBookDto } from "../dto/create-book.dto";
import { CreateCdDto } from "../dto/create-cd.dto";
import { CreateDvdDto } from "../dto/create-dvd.dto";
import { CreateNewspaperDto } from "../dto/create-newspaper.dto";
import { UpdateBookDto } from "../dto/update-book.dto";
import { UpdateCdDto } from "../dto/update-cd.dto";
import { UpdateDvdDto } from "../dto/update-dvd.dto";
import { UpdateNewspaperDto } from "../dto/update-newspapers.dto";

export interface ProductsStrategy {
    findAll(search?: string, category?: string);
    findOne(id: number);
    create(dto: CreateBookDto | CreateCdDto | CreateDvdDto | CreateNewspaperDto);
    update(id: number, dto: UpdateBookDto | UpdateCdDto | UpdateDvdDto | UpdateNewspaperDto);
    remove(id: number);
}
